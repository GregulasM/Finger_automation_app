import { $fetch } from "ofetch";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import {
  addEdge,
  type Connection,
  type Edge,
  type EdgeMouseEvent,
  type Node,
  useVueFlow,
} from "@vue-flow/core";

type NodeData = {
  label: string;
  type: string;
  role?: "trigger" | "action";
  actionType?: string;
  config?: Record<string, unknown>;
};

type PaletteItem = {
  id: string;
  label: string;
  type: string;
  role: "trigger" | "action";
  actionType?: string;
  config?: Record<string, unknown>;
  summary: string;
  details: string;
  tips?: string[];
};

export type WorkflowEditorProps = {
  workflowId?: string | null;
};

export function useWorkflowEditor(props: WorkflowEditorProps) {
  const flowId = "workflow-editor";

  const palette: PaletteItem[] = [
    {
      id: "webhook",
      label: "Webhook",
      type: "Webhook",
      role: "trigger",
      summary: "Incoming HTTP request triggers the workflow.",
      details:
        "Expose a webhook endpoint and start the flow when data is posted.",
      tips: [
        "Use JSON payloads from external apps.",
        "Save once to generate the URL.",
      ],
      config: {},
    },
    {
      id: "schedule",
      label: "Schedule",
      type: "Schedule",
      role: "trigger",
      summary: "Run the workflow on a cron schedule.",
      details:
        "Define a cron expression and timezone to trigger automatically.",
      tips: ["Example: */5 * * * *", "Timezone defaults to UTC."],
      config: { cron: "*/5 * * * *", timezone: "UTC" },
    },
    {
      id: "email-trigger",
      label: "Email",
      type: "Email",
      role: "trigger",
      summary: "Trigger when an inbound email arrives.",
      details: "Point your inbound email provider to the generated endpoint.",
      tips: ["Providers can POST email payloads.", "Save once to get the URL."],
      config: {},
    },
    {
      id: "http-request",
      label: "HTTP Request",
      type: "HTTP Request",
      role: "action",
      actionType: "HTTP Request",
      summary: "Send an HTTP request to an API.",
      details:
        "Configure method, headers, and body. The response becomes the next step input.",
      tips: ["Use output from previous steps.", "Timeout defaults to 15s."],
      config: { url: "", method: "POST", headers: "{}", body: "" },
    },
    {
      id: "email-action",
      label: "Email",
      type: "Email",
      role: "action",
      actionType: "Email",
      summary: "Send an email notification.",
      details: "Uses your configured email service with HTML or text content.",
      tips: ["Provide recipient and subject.", "HTML is optional."],
      config: { to: "", subject: "", html: "", text: "" },
    },
    {
      id: "telegram",
      label: "Telegram",
      type: "Telegram",
      role: "action",
      actionType: "Telegram",
      summary: "Send a message to Telegram.",
      details: "Requires a bot token and the target chat ID.",
      tips: ["Create a bot via BotFather.", "Use the chat ID of your target."],
      config: { botToken: "", chatId: "", message: "", parseMode: "Markdown" },
    },
    {
      id: "database",
      label: "Database",
      type: "Database",
      role: "action",
      actionType: "Database",
      summary: "Run a database operation.",
      details: "Executes a Prisma operation against your database.",
      tips: ["Model name matches Prisma client.", "Args must be valid JSON."],
      config: { model: "", operation: "create", args: "{}" },
    },
    {
      id: "transformation",
      label: "Transformation",
      type: "Transformation",
      role: "action",
      actionType: "Transformation",
      summary: "Transform or filter the payload.",
      details: "Use an expression or mapping to shape data between steps.",
      tips: [
        "Expression returns new payload.",
        "Mapping can pick fields by path.",
      ],
      config: { expression: "", mapping: "{}" },
    },
  ];

  const httpMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"];
  const errorModes = ["fail", "pause"];
  const telegramParseModes = ["Markdown", "MarkdownV2", "HTML"];
  const dbOperations = [
    "create",
    "update",
    "upsert",
    "delete",
    "findMany",
    "findUnique",
  ];
  const triggerTypeKeys = new Set(["webhook", "schedule", "cron", "email"]);

  // Helper to create node data from palette ID (for templates)
  function buildNodeFromPaletteId(
    paletteId: string,
    nodeId: string,
    position: { x: number; y: number },
    configOverrides?: Record<string, unknown>,
  ): Node<NodeData> {
    const item = palette.find((p) => p.id === paletteId);
    if (!item) {
      throw new Error(`Palette item not found: ${paletteId}`);
    }
    const role = item.role;
    const actionType =
      role === "action" ? (item.actionType ?? item.type) : item.type;
    return {
      id: nodeId,
      type: "default",
      draggable: true,
      selectable: true,
      position,
      data: {
        label: item.label,
        type: item.type,
        role,
        actionType,
        config: { ...(item.config ?? {}), ...configOverrides },
      },
    };
  }

  // Workflow templates - using palette items
  type WorkflowTemplateConfig = {
    id: string;
    nameKey: string;
    descriptionKey: string;
    blocks: {
      paletteId: string;
      position: { x: number; y: number };
      config?: Record<string, unknown>;
    }[];
  };

  const templateConfigs: WorkflowTemplateConfig[] = [
    {
      id: "webhook-telegram",
      nameKey: "templates.webhookTelegram.name",
      descriptionKey: "templates.webhookTelegram.description",
      blocks: [
        { paletteId: "webhook", position: { x: 100, y: 100 } },
        {
          paletteId: "telegram",
          position: { x: 400, y: 100 },
          config: { parseMode: "HTML" },
        },
      ],
    },
    {
      id: "cron-http-email",
      nameKey: "templates.cronHttpEmail.name",
      descriptionKey: "templates.cronHttpEmail.description",
      blocks: [
        {
          paletteId: "schedule",
          position: { x: 50, y: 100 },
          config: { cron: "0 9 * * *" },
        },
        {
          paletteId: "http-request",
          position: { x: 300, y: 100 },
          config: { method: "GET" },
        },
        {
          paletteId: "email-action",
          position: { x: 550, y: 100 },
          config: { subject: "Daily Report" },
        },
      ],
    },
    {
      id: "email-transform-db",
      nameKey: "templates.emailTransformDb.name",
      descriptionKey: "templates.emailTransformDb.description",
      blocks: [
        { paletteId: "email-trigger", position: { x: 50, y: 100 } },
        {
          paletteId: "transformation",
          position: { x: 300, y: 100 },
          config: { mode: "map" },
        },
        {
          paletteId: "database",
          position: { x: 550, y: 100 },
          config: { operation: "create" },
        },
      ],
    },
  ];

  const templateItems = computed(() => [
    templateConfigs.map((template) => ({
      label: t(template.nameKey),
      onSelect: () => loadTemplate(template),
    })),
  ]);

  function loadTemplate(template: WorkflowTemplateConfig) {
    if (nodes.value.length > 0) {
      if (!confirm(t("templates.confirmReplace"))) {
        return;
      }
    }

    workflowName.value = t(template.nameKey);

    // Create nodes from palette items
    const newNodes: Node<NodeData>[] = [];
    const newEdges: Edge[] = [];

    template.blocks.forEach((block, index) => {
      const nodeId = `node-${index + 1}`;
      try {
        const node = buildNodeFromPaletteId(
          block.paletteId,
          nodeId,
          block.position,
          block.config,
        );
        newNodes.push(normalizeLoadedNode(node, index));

        // Connect to previous node
        if (index > 0) {
          newEdges.push({
            id: `edge-${index}`,
            source: `node-${index}`,
            target: nodeId,
            type: "smoothstep",
          });
        }
      } catch (e) {
        console.warn(
          `Failed to create node from palette: ${block.paletteId}`,
          e,
        );
      }
    });

    nodes.value = newNodes;
    edges.value = newEdges;
    selectedNodeId.value = null;

    toast.add({
      title: t("templates.loaded"),
      description: t(template.descriptionKey),
      color: "success",
    });
  }

  const nodes = ref<Node<NodeData>[]>([]);
  const edges = ref<Edge[]>([]);
  const selectedNodeId = ref<string | null>(null);
  const selectedPaletteId = ref<string | null>(palette[0]?.id ?? null);
  const flowWrapper = ref<HTMLDivElement | null>(null);
  const workflowName = ref("Untitled workflow");
  const workflowActive = ref(true);
  const workflowId = ref<string | null>(null);
  const saveError = ref<string | null>(null);
  const saving = ref(false);
  const toast = useToast();
  const loadingWorkflow = ref(false);
  const loadError = ref<string | null>(null);
  const draggingItem = ref<PaletteItem | null>(null);
  const blockDetailsExpanded = ref(true);

  // IMAP testing state
  const imapTesting = ref(false);
  const imapTestResult = ref<{
    ok: boolean;
    error?: string;
    mailboxes?: string[];
  } | null>(null);
  const blocksMenuOpen = ref(false);
  const nodeSettingsMenuOpen = ref(false);
  const editorPanelOpen = useState<boolean>("editorPanelOpen", () => false);
  const mobileHintDismissed = ref(false);
  const multiSelectHintDismissed = ref(false);
  const selectedEdgeId = ref<string | null>(null);
  const telegramTesting = ref(false);
  const telegramTestResult = ref<{ ok: boolean; message: string } | null>(null);

  const isMobileViewport = () =>
    typeof window !== "undefined" && window.innerWidth < 1024;

  watch(blocksMenuOpen, (open) => {
    if (open && isMobileViewport()) {
      nodeSettingsMenuOpen.value = false;
      editorPanelOpen.value = false;
    }
  });

  watch(nodeSettingsMenuOpen, (open) => {
    if (open && isMobileViewport()) {
      blocksMenuOpen.value = false;
      editorPanelOpen.value = false;
    }
  });

  watch(editorPanelOpen, (open) => {
    if (open && isMobileViewport()) {
      blocksMenuOpen.value = false;
      nodeSettingsMenuOpen.value = false;
    }
  });

  // HTTP Request test state
  const httpTesting = ref(false);
  const httpTestResult = ref<{
    ok: boolean;
    status: number;
    data: string;
  } | null>(null);

  // Email content mode
  const emailContentMode = ref<"html" | "text" | "both">("html");

  // Email provider settings
  const emailProvider = ref<"gmail" | "sendgrid" | "resend">("gmail");
  const emailSmtpTesting = ref(false);
  const emailSmtpTestResult = ref<{
    ok: boolean;
    error?: string;
    details?: string;
  } | null>(null);
  const emailSending = ref(false);
  const emailSendResult = ref<{
    ok: boolean;
    error?: string;
    messageId?: string;
  } | null>(null);

  const emailProviders = [
    {
      id: "gmail" as const,
      name: "Gmail SMTP",
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></svg>',
    },
    {
      id: "sendgrid" as const,
      name: "SendGrid",
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M0 8h8v8H0V8zm0 8h8v8H0v-8zm8 0h8v8H8v-8zm8 0h8v8h-8v-8zm0-8h8v8h-8V8zm-8 0h8v8H8V8zM8 0h8v8H8V0zm8 0h8v8h-8V0z"/></svg>',
    },
    {
      id: "resend" as const,
      name: "Resend",
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L0 12l12 12 12-12L12 0zm0 3.2L20.8 12 12 20.8 3.2 12 12 3.2z"/></svg>',
    },
  ];

  function setEmailProvider(provider: "gmail" | "sendgrid" | "resend") {
    emailProvider.value = provider;
    updateTextConfig("emailProvider", provider);
    emailSmtpTestResult.value = null;
    emailSendResult.value = null;
  }

  // Auto-save emailProvider when Gmail fields are modified
  function updateGmailConfig(key: string, value: string) {
    updateTextConfig(key, value);
    // Ensure emailProvider is saved as 'gmail' when Gmail fields are filled
    if (
      !selectedConfig.value.emailProvider ||
      selectedConfig.value.emailProvider !== "gmail"
    ) {
      updateTextConfig("emailProvider", "gmail");
      emailProvider.value = "gmail";
    }
  }

  // Auto-save emailProvider when SendGrid fields are modified
  function updateSendGridConfig(key: string, value: string) {
    updateTextConfig(key, value);
    // Ensure emailProvider is saved as 'sendgrid' when SendGrid fields are filled
    if (
      !selectedConfig.value.emailProvider ||
      selectedConfig.value.emailProvider !== "sendgrid"
    ) {
      updateTextConfig("emailProvider", "sendgrid");
      emailProvider.value = "sendgrid";
    }
  }

  const canTestEmail = computed(() => {
    if (emailProvider.value === "gmail") {
      return Boolean(
        selectedConfig.value.smtpEmail && selectedConfig.value.smtpPassword,
      );
    }
    if (emailProvider.value === "sendgrid") {
      return Boolean(selectedConfig.value.sendgridApiKey);
    }
    // Resend uses env key by default
    return true;
  });

  const canSendTestEmail = computed(() => {
    return canTestEmail.value && Boolean(selectedConfig.value.to);
  });

  async function testEmailConnection() {
    emailSmtpTesting.value = true;
    emailSmtpTestResult.value = null;

    try {
      const response = await fetch("/api/email/test-smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test",
          provider: emailProvider.value,
          smtpEmail: selectedConfig.value.smtpEmail,
          smtpPassword: selectedConfig.value.smtpPassword,
          sendgridApiKey: selectedConfig.value.sendgridApiKey,
        }),
      });

      const data = await response.json();
      emailSmtpTestResult.value = data;
    } catch (error) {
      emailSmtpTestResult.value = { ok: false, error: String(error) };
    } finally {
      emailSmtpTesting.value = false;
    }
  }

  async function sendTestEmail() {
    emailSending.value = true;
    emailSendResult.value = null;

    try {
      const response = await fetch("/api/email/test-smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          provider: emailProvider.value,
          smtpEmail: selectedConfig.value.smtpEmail,
          smtpPassword: selectedConfig.value.smtpPassword,
          sendgridApiKey: selectedConfig.value.sendgridApiKey,
          from: selectedConfig.value.from,
          to: selectedConfig.value.to,
          subject:
            selectedConfig.value.subject || "Test Email from Finger Automation",
          html: selectedConfig.value.html,
          text: selectedConfig.value.text,
        }),
      });

      const data = await response.json();
      emailSendResult.value = data;
    } catch (error) {
      emailSendResult.value = { ok: false, error: String(error) };
    } finally {
      emailSending.value = false;
    }
  }

  // Transformation mode
  const transformMode = ref<"expression" | "mapping">("expression");

  // Mapping fields builder
  const mappingFields = ref<{ key: string; value: string }[]>([
    { key: "", value: "" },
  ]);

  // Clipboard state
  const clipboardCopied = ref<string | null>(null);

  // Cron presets
  const cronPresets = [
    { value: "* * * * *", label: "Every minute" },
    { value: "*/5 * * * *", label: "Every 5 min" },
    { value: "*/15 * * * *", label: "Every 15 min" },
    { value: "*/30 * * * *", label: "Every 30 min" },
    { value: "0 * * * *", label: "Every hour" },
    { value: "0 */6 * * *", label: "Every 6 hours" },
    { value: "0 0 * * *", label: "Daily at midnight" },
    { value: "0 9 * * *", label: "Daily at 9 AM" },
    { value: "0 0 * * 0", label: "Weekly (Sunday)" },
    { value: "0 0 1 * *", label: "Monthly (1st)" },
  ];

  // Common timezones
  const commonTimezones = [
    "UTC",
    "Europe/Moscow",
    "Europe/London",
    "Europe/Paris",
    "America/New_York",
    "America/Los_Angeles",
    "Asia/Tokyo",
    "Asia/Shanghai",
  ];

  // Стили для полей ввода - убираем ring ring-inset ring-accented в пассивном состоянии
  // При фокусе добавляем ring-2 для визуального отличия
  // Используем !important только для пассивного состояния, для focus - обычные классы
  // Standard text styles
  const textHeader =
    "text-[7px] 4xs:text-[8px] 3xs:text-[9px] 2xs:text-[10px] xs:text-[11px] sm:text-sm md:text-md lg:text-md 2xl:text-lg 3xl:text-lg/6 4xl:text-2xl/8 5xl:text-3xl/10 font-bold";
  const textBody =
    "text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12";
  const textSubtitle =
    "text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold";

  const inputStyles = {
    root: "ring-0",
    base: `ring-0 !ring-inset-0 bg-zinc-800 border border-orange-500 text-zinc-100 placeholder:text-zinc-500 focus:bg-zinc-800 focus:border-orange-500 focus:text-zinc-100 focus:!ring-2 focus:!ring-orange-500 focus:!ring-inset focus:ring-offset-0 focus-visible:!ring-2 focus-visible:!ring-orange-500 focus-visible:!ring-inset focus-visible:ring-offset-0 ${textBody}`,
  };

  const titleInputStyles = {
    ...inputStyles,
    base: `ring-0 !ring-inset-0 bg-zinc-800 border border-orange-500 text-zinc-100 placeholder:text-zinc-500 focus:bg-zinc-800 focus:border-orange-500 focus:text-zinc-100 focus:!ring-2 focus:!ring-orange-500 focus:!ring-inset focus:ring-offset-0 focus-visible:!ring-2 focus-visible:!ring-orange-500 focus-visible:!ring-inset focus-visible:ring-offset-0 ${textHeader}`,
  };

  const textareaStyles = {
    root: "ring-0",
    base: `ring-0 !ring-inset-0 bg-zinc-800 border border-orange-500 text-zinc-100 placeholder:text-zinc-500 focus:bg-zinc-800 focus:border-orange-500 focus:text-zinc-100 focus:!ring-2 focus:!ring-orange-500 focus:!ring-inset focus:ring-offset-0 focus-visible:!ring-2 focus-visible:!ring-orange-500 focus-visible:!ring-inset focus-visible:ring-offset-0 ${textBody}`,
  };

  const selectStyles = {
    root: "ring-0",
    base: `ring-0 !ring-inset-0 bg-zinc-800 border border-orange-500 text-zinc-100 focus:bg-zinc-800 focus:border-orange-500 focus:text-zinc-100 focus:!ring-2 focus:!ring-orange-500 focus:!ring-inset focus:ring-offset-0 focus-visible:!ring-2 focus-visible:!ring-orange-500 focus-visible:!ring-inset focus-visible:ring-offset-0 ${textBody}`,
  };

  const selectMenuStyles = {
    base: `ring-0 !ring-inset-0 bg-zinc-800 border border-orange-500 text-zinc-100 focus:bg-zinc-800 focus:border-orange-500 focus:text-zinc-100 focus:!ring-2 focus:!ring-orange-500 focus:!ring-inset focus:ring-offset-0 focus-visible:!ring-2 focus-visible:!ring-orange-500 focus-visible:!ring-inset focus-visible:ring-offset-0 ${textBody}`,
  };

  // Стили для FormField - убираем text-default
  const formFieldStyles = {
    label: "!text-zinc-100 font-semibold",
  };

  const selectedNode = computed(
    () =>
      nodes.value.find((node) => String(node.id) === selectedNodeId.value) ??
      null,
  );
  const selectedConfig = computed(() => {
    const data = selectedNode.value?.data;
    if (!data) {
      return {};
    }
    if (data.config && typeof data.config === "object") {
      return data.config as Record<string, unknown>;
    }
    return data as Record<string, unknown>;
  });
  const selectedType = computed(() =>
    normalizeNodeType(getNodeRawType(selectedNode.value)),
  );
  const selectedRole = computed(() => inferNodeRole(selectedNode.value));
  const selectedActionType = computed(() =>
    selectedRole.value === "action" ? selectedType.value : "",
  );
  const selectedLabel = computed(
    () => selectedNode.value?.data?.label || selectedType.value || "Node",
  );

  // Telegram test helpers
  const canTestTelegram = computed(() => {
    const config = selectedConfig.value;
    const botToken = String(config.botToken ?? "").trim();
    const chatId = String(config.chatId ?? "").trim();
    return botToken.length > 0 && chatId.length > 0;
  });

  async function testTelegramMessage() {
    if (!canTestTelegram.value || telegramTesting.value) return;

    const config = selectedConfig.value;
    const botToken = String(config.botToken ?? "").trim();
    const chatId = String(config.chatId ?? "").trim();
    const message =
      String(config.message ?? "").trim() || t("editor.telegram.testMessage");
    const parseMode = String(config.parseMode ?? "Markdown");

    telegramTesting.value = true;
    telegramTestResult.value = null;

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: parseMode !== "None" ? parseMode : undefined,
          }),
        },
      );

      const data = await response.json();

      if (response.ok && data.ok) {
        telegramTestResult.value = {
          ok: true,
          message: t("editor.telegram.testSuccess"),
        };
      } else {
        const errorMsg = data.description || t("editor.telegram.testFailed");
        telegramTestResult.value = { ok: false, message: errorMsg };
      }
    } catch (error) {
      telegramTestResult.value = {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : t("editor.telegram.testFailed"),
      };
    } finally {
      telegramTesting.value = false;
      // Clear result after 5 seconds
      setTimeout(() => {
        telegramTestResult.value = null;
      }, 5000);
    }
  }

  // HTTP Request test helpers
  const canTestHttp = computed(() => {
    const config = selectedConfig.value;
    const url = String(config.url ?? "").trim();
    return (
      url.length > 0 &&
      (url.startsWith("http://") || url.startsWith("https://"))
    );
  });

  // Clipboard copy helper
  async function copyToClipboard(text: string, type: string = "webhook") {
    try {
      await navigator.clipboard.writeText(text);
      clipboardCopied.value = type;
      setTimeout(() => {
        clipboardCopied.value = null;
      }, 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      clipboardCopied.value = type;
      setTimeout(() => {
        clipboardCopied.value = null;
      }, 2000);
    }
  }

  // IMAP connection test
  async function testImapConnection() {
    if (imapTesting.value) return;

    const config = selectedConfig.value;
    const email = String(config.imapEmail ?? "").trim();
    const password = String(config.imapPassword ?? "").trim();

    if (!email || !password) {
      imapTestResult.value = {
        ok: false,
        error: t("editor.emailTrigger.enterCredentials"),
      };
      return;
    }

    imapTesting.value = true;
    imapTestResult.value = null;

    try {
      const response = await $fetch<{
        ok: boolean;
        error?: string;
        mailboxes?: string[];
        server?: { host: string; port: number; autoDetected: boolean };
      }>("/api/email/test-imap", {
        method: "POST",
        body: {
          email,
          password,
          host: config.imapHost || undefined,
          port: config.imapPort || undefined,
        },
      });

      imapTestResult.value = response;

      // Auto-fill server info if auto-detected
      if (response.ok && response.server?.autoDetected) {
        // Server was auto-detected, no need to fill
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      imapTestResult.value = { ok: false, error: message };
    } finally {
      imapTesting.value = false;

      // Clear result after 10 seconds
      setTimeout(() => {
        imapTestResult.value = null;
      }, 10000);
    }
  }

  async function testHttpRequest() {
    if (!canTestHttp.value || httpTesting.value) return;

    const config = selectedConfig.value;
    const url = String(config.url ?? "").trim();
    const method = String(config.method ?? "GET").toUpperCase();
    const headersStr = String(config.headers ?? "{}");
    const body = String(config.body ?? "");

    let headers: Record<string, string> = {};
    try {
      headers = JSON.parse(headersStr);
    } catch {
      headers = {};
    }

    let isInternalHook = false;
    try {
      const parsedUrl = new URL(url);
      isInternalHook =
        Boolean(appOrigin.value) &&
        parsedUrl.origin === appOrigin.value &&
        (parsedUrl.pathname.startsWith("/api/hooks/") ||
          parsedUrl.pathname.startsWith("/api/email/inbound/"));
    } catch {
      isInternalHook = false;
    }

    const chainHeaderKey = "x-workflow-chain";
    const hasChainHeader = Object.keys(headers).some(
      (key) => key.toLowerCase() === chainHeaderKey,
    );
    if (isInternalHook && workflowId.value && !hasChainHeader) {
      headers[chainHeaderKey] = workflowId.value;
    }

    httpTesting.value = true;
    httpTestResult.value = null;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: ["GET", "HEAD"].includes(method) ? undefined : body || "{}",
      });

      const contentType = response.headers.get("content-type") || "";
      let data: string;
      if (contentType.includes("application/json")) {
        const json = await response.json();
        data = JSON.stringify(json, null, 2);
      } else {
        data = await response.text();
      }

      // Truncate long responses
      if (data.length > 500) {
        data = data.substring(0, 500) + "\n... (truncated)";
      }

      httpTestResult.value = {
        ok: response.ok,
        status: response.status,
        data,
      };

      if (isInternalHook && response.status === 409) {
        toast.add({
          title: t("editor.http.recursionBlocked"),
          description: t("editor.http.recursionBlockedDesc"),
          color: "error",
          timeout: 4000,
        });
      }
    } catch (error) {
      httpTestResult.value = {
        ok: false,
        status: 0,
        data: error instanceof Error ? error.message : "Request failed",
      };
    } finally {
      httpTesting.value = false;
    }
  }

  // Database helpers
  const availableDbModels = [
    { value: "user", label: "User" },
    { value: "workflow", label: "Workflow" },
    { value: "execution", label: "Execution" },
    { value: "executionStep", label: "ExecutionStep" },
  ];

  const dbOperationsWithDesc = computed(() => [
    { value: "create", label: "Create", desc: t("editor.db.opCreate") },
    { value: "findMany", label: "Find Many", desc: t("editor.db.opFindMany") },
    {
      value: "findUnique",
      label: "Find One",
      desc: t("editor.db.opFindUnique"),
    },
    { value: "update", label: "Update", desc: t("editor.db.opUpdate") },
    { value: "upsert", label: "Upsert", desc: t("editor.db.opUpsert") },
    { value: "delete", label: "Delete", desc: t("editor.db.opDelete") },
  ]);

  function getDbArgsPlaceholder(operation: string) {
    const placeholders: Record<string, string> = {
      create: '{"data": {"field": "value"}}',
      findMany: '{"where": {"status": "ACTIVE"}, "take": 10}',
      findUnique: '{"where": {"id": "..."}}',
      update: '{"where": {"id": "..."}, "data": {"field": "newValue"}}',
      upsert: '{"where": {"id": "..."}, "create": {...}, "update": {...}}',
      delete: '{"where": {"id": "..."}}',
    };
    return placeholders[operation] || "{}";
  }

  function getDbArgsExample(operation: string) {
    const examples: Record<string, string> = {
      create: `{
    "data": {
      "email": "user@example.com",
      "name": "New User"
    }
  }`,
      findMany: `{
    "where": {
      "status": "ACTIVE"
    },
    "take": 10,
    "orderBy": { "createdAt": "desc" }
  }`,
      findUnique: `{
    "where": {
      "id": "abc-123"
    }
  }`,
      update: `{
    "where": { "id": "abc-123" },
    "data": {
      "name": "Updated Name"
    }
  }`,
      upsert: `{
    "where": { "email": "user@example.com" },
    "create": { "email": "user@example.com", "name": "New" },
    "update": { "name": "Existing" }
  }`,
      delete: `{
    "where": {
      "id": "abc-123"
    }
  }`,
    };
    return examples[operation] || "{}";
  }

  function applyDbArgsTemplate(operation: string) {
    updateTextConfig("args", getDbArgsExample(operation));
  }

  function updateDbArgsTemplate(operation: string) {
    // Only update if args is empty or default
    const currentArgs = String(selectedConfig.value.args ?? "").trim();
    if (!currentArgs || currentArgs === "{}") {
      // Don't auto-apply, just let user see the placeholder
    }
  }

  // Transformation helpers
  const expressionExamples = computed(() => [
    { desc: t("editor.transform.exPassthrough"), code: "input" },
    { desc: t("editor.transform.exExtract"), code: "input.user.email" },
    {
      desc: t("editor.transform.exTransform"),
      code: '({ name: input.firstName + " " + input.lastName, isAdult: input.age >= 18 })',
    },
    {
      desc: t("editor.transform.exFilter"),
      code: "input.items.filter(item => item.active)",
    },
    {
      desc: t("editor.transform.exMath"),
      code: "({ total: input.price * input.quantity, tax: input.price * 0.2 })",
    },
  ]);

  function addMappingField() {
    mappingFields.value.push({ key: "", value: "" });
  }

  function removeMappingField(index: number) {
    mappingFields.value.splice(index, 1);
    syncMappingToConfig();
  }

  function updateMappingField(
    index: number,
    field: "key" | "value",
    val: string,
  ) {
    const item = mappingFields.value[index];
    if (item) {
      item[field] = val;
    }
    syncMappingToConfig();
  }

  function syncMappingToConfig() {
    const mapping: Record<string, string> = {};
    for (const field of mappingFields.value) {
      if (field.key.trim()) {
        mapping[field.key.trim()] = field.value.trim() || "input";
      }
    }
    updateTextConfig("mapping", JSON.stringify(mapping, null, 2));
  }

  // Watch mapping config changes to sync back to builder
  watch(
    () => selectedConfig.value.mapping,
    (newMapping) => {
      try {
        const parsed =
          typeof newMapping === "string" ? JSON.parse(newMapping) : newMapping;
        if (parsed && typeof parsed === "object") {
          const entries = Object.entries(parsed);
          if (entries.length > 0) {
            mappingFields.value = entries.map(([key, value]) => ({
              key,
              value: String(value),
            }));
          }
        }
      } catch {
        // Invalid JSON, ignore
      }
    },
    { immediate: true },
  );

  const selectedPalette = computed(
    () => palette.find((item) => item.id === selectedPaletteId.value) ?? null,
  );
  const selectedHelp = computed(() => {
    if (!selectedRole.value || !selectedType.value) {
      return null;
    }
    const typeKey = normalizePaletteType(selectedType.value);
    return (
      palette.find(
        (item) =>
          item.role === selectedRole.value &&
          normalizePaletteType(item.type) === typeKey,
      ) ?? null
    );
  });
  const { t } = useI18n();

  function getTranslatedPaletteItem(item: PaletteItem): PaletteItem {
    const key = item.id;
    const roleKey = item.role === "trigger" ? "trigger" : "action";

    return {
      ...item,
      summary: t(`editor.palette.${key}.summary`) || item.summary,
      details: t(`editor.palette.${key}.details`) || item.details,
      tips:
        item.tips?.map(
          (tip, index) => t(`editor.palette.${key}.tip${index + 1}`) || tip,
        ) || [],
      role: item.role, // Keep original role for logic, translate only in display
    };
  }

  function getTranslatedRole(role: "trigger" | "action"): string {
    return t(`editor.palette.role.${role}`) || role;
  }

  const translatedPalette = computed(() =>
    palette.map((item) => getTranslatedPaletteItem(item)),
  );

  const translatedSelectedPalette = computed(() =>
    selectedPalette.value
      ? getTranslatedPaletteItem(selectedPalette.value)
      : null,
  );

  const translatedSelectedHelp = computed(() =>
    selectedHelp.value ? getTranslatedPaletteItem(selectedHelp.value) : null,
  );

  // Get all CONNECTED triggers (have at least one outgoing edge)
  const connectedTriggers = computed(() => {
    const connectedNodeIds = new Set(edges.value.map((e) => e.source));
    return nodes.value.filter((node) => {
      const role = inferNodeRole(node);
      return role === "trigger" && connectedNodeIds.has(String(node.id));
    });
  });

  const triggerLabel = computed(() => {
    const connected = connectedTriggers.value;
    if (connected.length === 0) {
      return t("editor.notConnected");
    }
    if (connected.length === 1) {
      const first = connected[0];
      return first?.data?.label ?? t("editor.notSet");
    }
    // Multiple triggers - list them all
    return connected.map((n) => n.data?.label ?? "?").join(", ");
  });

  watch(
    selectedHelp,
    (help) => {
      if (help) {
        selectedPaletteId.value = help.id;
      }
    },
    { immediate: true },
  );

  watch(selectedNode, (node) => {
    if (!node && selectedNodeId.value) {
      selectedNodeId.value = null;
    }

    // Initialize emailProvider from saved config when selecting Email action node
    if (node) {
      const nodeData = node.data as Record<string, unknown> | undefined;
      const config = (nodeData?.config ?? {}) as Record<string, unknown>;
      const role = String(nodeData?.role ?? "").toLowerCase();
      const actionType = String(
        nodeData?.actionType ?? nodeData?.type ?? "",
      ).toLowerCase();

      if (role === "action" && actionType === "email") {
        const savedProvider = config.emailProvider as string | undefined;
        if (
          savedProvider === "gmail" ||
          savedProvider === "sendgrid" ||
          savedProvider === "resend"
        ) {
          emailProvider.value = savedProvider;
        } else if (config.smtpEmail || config.smtpPassword) {
          // If Gmail credentials exist but provider not saved, set to gmail
          emailProvider.value = "gmail";
        } else if (config.sendgridApiKey) {
          // If SendGrid key exists but provider not saved, set to sendgrid
          emailProvider.value = "sendgrid";
        } else {
          // Default to gmail for new nodes
          emailProvider.value = "gmail";
        }
      }
    }

    // Reset test results when switching nodes
    emailSmtpTestResult.value = null;
    emailSendResult.value = null;
  });

  function normalizePaletteType(value: string) {
    const key = value.toLowerCase().trim();
    if (key === "cron" || key === "schedule") {
      return "schedule";
    }
    return key;
  }

  function normalizeNodeType(value: string) {
    const key = normalizePaletteType(value);
    if (!key) {
      return "";
    }
    if (key === "webhook") {
      return "Webhook";
    }
    if (key === "schedule") {
      return "Schedule";
    }
    if (key === "email") {
      return "Email";
    }
    if (key === "http request") {
      return "HTTP Request";
    }
    if (key === "telegram") {
      return "Telegram";
    }
    if (key === "database") {
      return "Database";
    }
    if (key === "transformation") {
      return "Transformation";
    }
    return value;
  }

  function getNodeRawType(node?: Node<NodeData> | null) {
    if (!node) {
      return "";
    }
    const data = node.data ?? {};
    return String(data.type ?? data.actionType ?? node.type ?? "");
  }

  function inferNodeRole(node?: Node<NodeData> | null) {
    if (!node) {
      return "";
    }

    const data = node.data ?? {};
    if (data.role) {
      return data.role;
    }
    if (data.actionType) {
      return "action";
    }

    const config =
      data.config && typeof data.config === "object"
        ? (data.config as Record<string, unknown>)
        : (data as Record<string, unknown>);

    const actionKeys = [
      "url",
      "method",
      "headers",
      "body",
      "to",
      "subject",
      "html",
      "text",
      "botToken",
      "chatId",
      "message",
      "parseMode",
      "model",
      "operation",
      "args",
      "expression",
      "mapping",
    ];

    const triggerKeys = ["cron", "timezone"];

    if (actionKeys.some((key) => key in config)) {
      return "action";
    }
    if (triggerKeys.some((key) => key in config)) {
      return "trigger";
    }

    const rawType = normalizePaletteType(getNodeRawType(node));
    if (!rawType) {
      return "";
    }
    return triggerTypeKeys.has(rawType) ? "trigger" : "action";
  }

  function getTriggerNode() {
    return nodes.value.find((node) => {
      return inferNodeRole(node) === "trigger";
    });
  }

  function normalizeLoadedNode(raw: Node<NodeData>, index: number) {
    const node = raw as Node<NodeData>;
    const data = node.data && typeof node.data === "object" ? node.data : {};
    const rawType = getNodeRawType({ ...node, data: data as NodeData });
    const type = normalizeNodeType(rawType);
    const role = inferNodeRole({ ...node, data: data as NodeData });
    const actionType =
      (data as NodeData).actionType ?? (role === "action" ? type : undefined);
    const config = {
      ...(data &&
      typeof (data as NodeData).config === "object" &&
      (data as NodeData).config
        ? (data as NodeData).config
        : {}),
    } as Record<string, unknown>;
    const configKeys = [
      "cron",
      "timezone",
      "url",
      "method",
      "headers",
      "body",
      "to",
      "subject",
      "html",
      "text",
      "botToken",
      "chatId",
      "message",
      "parseMode",
      "model",
      "operation",
      "args",
      "expression",
      "mapping",
      "retryCount",
      "retryDelayMs",
      "onError",
      "notifyEmail",
    ];
    for (const key of configKeys) {
      if (key in data && !(key in config)) {
        config[key] = (data as Record<string, unknown>)[key];
      }
    }
    if (role === "action" && type === "Telegram") {
      const parseMode = String(config.parseMode ?? "").trim();
      if (!parseMode) {
        config.parseMode = "Markdown";
      }
    }

    return {
      ...node,
      id: String(node.id ?? index),
      draggable: true,
      selectable: true,
      data: {
        ...(data as NodeData),
        label:
          typeof (data as NodeData).label === "string" &&
          (data as NodeData).label.trim()
            ? (data as NodeData).label
            : type || "Node",
        type,
        role,
        actionType,
        config,
      },
    };
  }

  const { project } = useVueFlow(flowId);
  const runtimeConfig = useRuntimeConfig();
  const requestUrl = useRequestURL();
  const appUrl = computed(() => {
    const configUrl = runtimeConfig.public?.appUrl || "";
    if (configUrl && configUrl !== "http://localhost:3000") {
      return configUrl;
    }
    return requestUrl.origin || configUrl;
  });
  const appOrigin = computed(() => {
    try {
      return new URL(appUrl.value).origin;
    } catch {
      return "";
    }
  });
  const webhookEndpoint = computed(() =>
    workflowId.value ? `${appUrl.value}/api/hooks/${workflowId.value}` : "",
  );
  const emailEndpoint = computed(() =>
    workflowId.value
      ? `${appUrl.value}/api/email/inbound/${workflowId.value}`
      : "",
  );

  function selectPalette(item: PaletteItem) {
    selectedPaletteId.value = item.id;
  }

  function createNodeFromPalette(
    item: PaletteItem,
    position: { x: number; y: number },
  ) {
    const nodeId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${item.id}-${Date.now()}`;
    const role = item.role;
    const actionType =
      role === "action" ? (item.actionType ?? item.type) : undefined;

    nodes.value = [
      ...nodes.value,
      {
        id: nodeId,
        type: "default",
        draggable: true,
        selectable: true,
        position,
        data: {
          label: item.label,
          type: item.type,
          role,
          actionType,
          config: { ...(item.config ?? {}) },
        },
      },
    ];

    return nodeId;
  }

  // Счетчик для смещения новых узлов
  let nodeAddOffset = 0;

  function addNodeFromPalette(item: PaletteItem) {
    selectPalette(item);
    if (!flowWrapper.value) {
      return;
    }

    const bounds = flowWrapper.value.getBoundingClientRect();

    // Смещаем каждый новый узел, чтобы они не накладывались
    const offset = nodeAddOffset * 40;
    nodeAddOffset = (nodeAddOffset + 1) % 10; // Сбрасываем после 10 узлов

    const position = project({
      x: bounds.width / 2 + offset,
      y: bounds.height / 2 + offset,
    });

    const nodeId = createNodeFromPalette(item, position);
    selectedNodeId.value = nodeId;
  }

  function onDragStart(event: DragEvent, item: PaletteItem) {
    selectPalette(item);
    draggingItem.value = item;
    if (!event.dataTransfer) {
      return;
    }
    event.dataTransfer.setData("text/plain", item.id);
    event.dataTransfer.setData("application/vueflow", JSON.stringify(item));
    event.dataTransfer.effectAllowed = "move";
  }

  function onDragEnd() {
    draggingItem.value = null;
  }

  function onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    if (!flowWrapper.value) {
      return;
    }

    const raw = event.dataTransfer?.getData("application/vueflow");
    let item: PaletteItem | null = null;
    if (raw) {
      try {
        item = JSON.parse(raw) as PaletteItem;
      } catch {
        item = null;
      }
    }

    if (!item) {
      const fallbackId = event.dataTransfer?.getData("text/plain") ?? "";
      const normalizedFallback = fallbackId.trim().toLowerCase();
      item =
        palette.find((entry) => entry.id === fallbackId) ??
        palette.find(
          (entry) =>
            entry.label.toLowerCase() === normalizedFallback ||
            entry.type.toLowerCase() === normalizedFallback,
        ) ??
        (selectedPaletteId.value
          ? (palette.find((entry) => entry.id === selectedPaletteId.value) ??
            null)
          : null);
    }

    if (!item && draggingItem.value) {
      item = draggingItem.value;
    }

    if (!item) {
      return;
    }
    draggingItem.value = null;

    const bounds = flowWrapper.value.getBoundingClientRect();
    const position = project({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });

    const nodeId = createNodeFromPalette(item, position);
    selectedNodeId.value = nodeId;
  }

  function onConnect(params: Connection) {
    edges.value = addEdge(params, edges.value) as Edge[];
  }

  function onNodeClick(
    event: { node?: Node<NodeData> } | Node<NodeData> | MouseEvent | null,
    nodeFromEvent?: Node<NodeData>,
  ) {
    const node =
      nodeFromEvent ?? (event && "node" in event ? event.node : event);
    if (!node?.id) {
      return;
    }
    selectedNodeId.value = String(node.id);

    // Open right panel on mobile when node is clicked
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      nodeSettingsMenuOpen.value = true;
      blocksMenuOpen.value = false;
    }
  }

  function clearSelection() {
    selectedNodeId.value = null;
    selectedEdgeId.value = null;
  }

  function onEdgeClick(event: EdgeMouseEvent) {
    const edge = event.edge;
    if (!edge?.id) {
      return;
    }
    selectedEdgeId.value = String(edge.id);
    selectedNodeId.value = null;
  }

  function removeEdgeById(edgeId: string) {
    edges.value = edges.value.filter((edge) => String(edge.id) !== edgeId);
    if (selectedEdgeId.value === edgeId) {
      selectedEdgeId.value = null;
    }
  }

  function removeSelectedEdge() {
    if (!selectedEdgeId.value) {
      return;
    }
    removeEdgeById(selectedEdgeId.value);
  }

  function removeNodeById(nodeId: string) {
    nodes.value = nodes.value.filter((node) => String(node.id) !== nodeId);
    edges.value = edges.value.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId,
    );
    if (selectedNodeId.value === nodeId) {
      selectedNodeId.value = null;
    }
  }

  function removeSelectedNode() {
    if (!selectedNodeId.value) {
      return;
    }
    removeNodeById(selectedNodeId.value);
  }

  function handleKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement | null;
    const tagName = target?.tagName?.toLowerCase();
    if (
      tagName === "input" ||
      tagName === "textarea" ||
      tagName === "select" ||
      target?.isContentEditable
    ) {
      return;
    }

    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      if (selectedEdgeId.value) {
        removeSelectedEdge();
      } else if (selectedNodeId.value) {
        removeSelectedNode();
      }
    }
  }

  onMounted(() => {
    window.addEventListener("keydown", handleKeydown);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("keydown", handleKeydown);
  });

  function updateSelectedConfig(patch: Record<string, unknown>) {
    if (!selectedNode.value) {
      return;
    }

    nodes.value = nodes.value.map((node) => {
      if (node.id !== selectedNode.value?.id) {
        return node;
      }
      const data = (node.data ?? {}) as NodeData;
      const nextConfig = { ...(data.config ?? {}), ...patch };
      return {
        ...node,
        data: {
          ...data,
          config: nextConfig,
        },
      };
    });
  }

  function updateTextConfig(key: string, value: string | number) {
    updateSelectedConfig({ [key]: value });
  }

  function updateNumberConfig(key: string, value: string | number) {
    const numeric = Number(value);
    updateSelectedConfig({
      [key]: Number.isFinite(numeric) ? numeric : 0,
    });
  }

  function formatJsonConfig(value: unknown, fallback = "") {
    if (typeof value === "string") {
      return value;
    }
    if (value && typeof value === "object") {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return fallback;
      }
    }
    return fallback;
  }

  async function loadWorkflow(id: string) {
    loadingWorkflow.value = true;
    loadError.value = null;
    try {
      const response = await $fetch<{
        id: string;
        name: string;
        status: "ACTIVE" | "INACTIVE";
        graphData: { nodes?: Node<NodeData>[]; edges?: Edge[] };
      }>(`/api/workflows/${id}`, {
        credentials: "include",
      });

      workflowId.value = response.id;
      workflowName.value = response.name;
      workflowActive.value = response.status === "ACTIVE";
      nodes.value = Array.isArray(response.graphData?.nodes)
        ? response.graphData.nodes.map((node, index) =>
            normalizeLoadedNode(node as Node<NodeData>, index),
          )
        : [];
      edges.value = Array.isArray(response.graphData?.edges)
        ? response.graphData.edges
        : [];
      selectedNodeId.value = null;
    } catch (error) {
      loadError.value = getErrorMessage(error);
    } finally {
      loadingWorkflow.value = false;
    }
  }

  watch(
    () => props.workflowId,
    (id) => {
      if (id) {
        void loadWorkflow(id);
      }
    },
    { immediate: true },
  );

  async function saveWorkflow() {
    saveError.value = null;

    const name = workflowName.value.trim();
    if (!name) {
      saveError.value = t("editor.workflowNameRequired");
      return;
    }

    const triggerType = resolveTriggerType();
    if (!triggerType) {
      saveError.value = t("editor.addTriggerBeforeSaving");
      return;
    }

    const payload = {
      name,
      status: workflowActive.value ? "ACTIVE" : "INACTIVE",
      triggerType,
      graphData: {
        nodes: nodes.value,
        edges: edges.value,
      },
    };

    saving.value = true;
    try {
      if (workflowId.value) {
        const response = await $fetch<{ id: string }>(
          `/api/workflows/${workflowId.value}`,
          {
            method: "PUT",
            body: payload,
            credentials: "include",
          },
        );
        workflowId.value = response.id ?? workflowId.value;
        toast.add({
          title: t("editor.saved"),
          description: t("editor.workflowUpdated"),
          color: "success",
          timeout: 3000,
        });
      } else {
        const response = await $fetch<{ id: string }>("/api/workflows", {
          method: "POST",
          body: payload,
          credentials: "include",
        });
        workflowId.value = response.id ?? null;
        toast.add({
          title: t("editor.saved"),
          description: t("editor.workflowSaved"),
          color: "success",
          timeout: 3000,
        });
      }
    } catch (error) {
      saveError.value = getErrorMessage(error);
    } finally {
      saving.value = false;
    }
  }

  function resolveTriggerType() {
    const triggerNode = getTriggerNode();
    const raw = normalizePaletteType(getNodeRawType(triggerNode));
    if (!raw) {
      return null;
    }
    if (raw === "schedule") {
      return "CRON";
    }
    if (raw === "email") {
      return "EMAIL";
    }
    return "WEBHOOK";
  }

  function getErrorMessage(error: unknown) {
    if (error && typeof error === "object") {
      const data = (
        error as { data?: { statusMessage?: string; message?: string } }
      ).data;
      if (data?.statusMessage) {
        return data.statusMessage;
      }
      if (data?.message) {
        return data.message;
      }
    }
    if (error instanceof Error) {
      return error.message;
    }
    return "Unexpected error.";
  }

  return {
    flowId,
    palette,
    httpMethods,
    errorModes,
    telegramParseModes,
    dbOperations,
    triggerTypeKeys,
    buildNodeFromPaletteId,
    templateConfigs,
    templateItems,
    loadTemplate,
    nodes,
    edges,
    selectedNodeId,
    selectedPaletteId,
    flowWrapper,
    workflowName,
    workflowActive,
    workflowId,
    saveError,
    saving,
    toast,
    loadingWorkflow,
    loadError,
    draggingItem,
    blockDetailsExpanded,
    imapTesting,
    imapTestResult,
    blocksMenuOpen,
    nodeSettingsMenuOpen,
    editorPanelOpen,
    mobileHintDismissed,
    multiSelectHintDismissed,
    selectedEdgeId,
    telegramTesting,
    telegramTestResult,
    isMobileViewport,
    httpTesting,
    httpTestResult,
    emailContentMode,
    emailProvider,
    emailSmtpTesting,
    emailSmtpTestResult,
    emailSending,
    emailSendResult,
    emailProviders,
    setEmailProvider,
    updateGmailConfig,
    updateSendGridConfig,
    canTestEmail,
    canSendTestEmail,
    testEmailConnection,
    sendTestEmail,
    transformMode,
    mappingFields,
    clipboardCopied,
    cronPresets,
    commonTimezones,
    textHeader,
    textBody,
    textSubtitle,
    inputStyles,
    titleInputStyles,
    textareaStyles,
    selectStyles,
    selectMenuStyles,
    formFieldStyles,
    selectedNode,
    selectedConfig,
    selectedType,
    selectedRole,
    selectedActionType,
    selectedLabel,
    canTestTelegram,
    testTelegramMessage,
    canTestHttp,
    copyToClipboard,
    testImapConnection,
    testHttpRequest,
    availableDbModels,
    dbOperationsWithDesc,
    getDbArgsPlaceholder,
    getDbArgsExample,
    applyDbArgsTemplate,
    updateDbArgsTemplate,
    expressionExamples,
    addMappingField,
    removeMappingField,
    updateMappingField,
    syncMappingToConfig,
    selectedPalette,
    selectedHelp,
    t,
    getTranslatedPaletteItem,
    getTranslatedRole,
    translatedPalette,
    translatedSelectedPalette,
    translatedSelectedHelp,
    connectedTriggers,
    triggerLabel,
    normalizePaletteType,
    normalizeNodeType,
    getNodeRawType,
    inferNodeRole,
    getTriggerNode,
    normalizeLoadedNode,
    project,
    runtimeConfig,
    appUrl,
    webhookEndpoint,
    emailEndpoint,
    selectPalette,
    createNodeFromPalette,
    addNodeFromPalette,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDrop,
    onConnect,
    onNodeClick,
    clearSelection,
    onEdgeClick,
    removeEdgeById,
    removeSelectedEdge,
    removeNodeById,
    removeSelectedNode,
    handleKeydown,
    updateSelectedConfig,
    updateTextConfig,
    updateNumberConfig,
    formatJsonConfig,
    loadWorkflow,
    saveWorkflow,
    resolveTriggerType,
    getErrorMessage,
  };
}

export type WorkflowEditorContext = ReturnType<typeof useWorkflowEditor>;
