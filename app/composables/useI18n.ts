import { readonly } from "vue";

export const useI18n = () => {
  const locale = useState<"en" | "ru">("locale", () => "en");
  const localeInitialized = useState<boolean>(
    "locale-initialized",
    () => false,
  );

  const translations: Record<string, Record<string, string>> = {
    en: {
      // Common
      "common.edit": "Edit",
      "common.delete": "Delete",
      "common.save": "Save",
      "common.cancel": "Cancel",
      "common.back": "← Back",
      "common.loading": "Loading...",
      "common.user": "User",
      "common.logout": "Logout",
      "common.signIn": "Sign in",
      "common.new": "New",
      "common.home": "Home",
      "common.editor": "Editor",
      "common.close": "Close",

      // Navigation
      "nav.home": "Home",
      "nav.workflows": "Workflows",
      "nav.editor": "Editor",
      "nav.newWorkflow": "New workflow",
      "nav.openWorkflowEditor": "Open workflow editor",
      "nav.viewDashboard": "View dashboard",

      // Index page
      "index.title": "Automate your stack with visual workflows.",
      "index.description":
        "Build triggers, chain actions, and ship workflows in minutes. Connect Webhooks, Schedules, and HTTP requests with resilient serverless execution.",
      "index.webhookTriggers": "Webhook triggers",
      "index.webhookTooltip":
        "Start workflows instantly via HTTP POST requests to unique endpoints",
      "index.cronSchedules": "Cron schedules",
      "index.cronTooltip":
        "Run workflows automatically on time-based schedules (every minute, hour, day, etc.)",
      "index.jsonFirstWorkflows": "JSON-first workflows",
      "index.jsonTooltip":
        "Workflows stored as JSON graphs with full execution history and audit logs",
      "index.fromTriggerToAction": "From trigger to action",
      "index.fromTriggerToActionDesc":
        "Design flows visually, then store the graph as JSONB with full execution history.",
      "index.reliableExecution": "Reliable execution",
      "index.reliableExecutionDesc":
        "QStash handles queueing and retries while the runner isolates each workflow run.",
      "index.auditReadyLogs": "Audit-ready logs",
      "index.auditReadyLogsDesc":
        "Step-by-step logging, timings, and outputs stay available for every run.",
      "index.screenshotsTitle": "Product screenshots",
      "index.screenshotEditorTitle": "Workflow editor",
      "index.screenshotDetailsTitle": "Details",
      "index.screenshotLogsTitle": "Audit logs",

      // Workflows page
      "workflows.title": "Workflows",
      "workflows.description":
        "Track activity, performance, and recent executions.",
      "workflows.newWorkflow": "New workflow",
      "workflows.workflowList": "Workflow list",
      "workflows.loadingWorkflows": "Loading workflows...",
      "workflows.selectWorkflow": "Select a workflow",
      "workflows.overview": "Overview",
      "workflows.triggerType": "Trigger type",
      "workflows.lastUpdated": "Last updated",
      "workflows.updated": "Updated",
      "workflows.created": "Created",
      "workflows.totalRuns": "Total runs",
      "workflows.successRate": "Success rate",
      "workflows.avgDuration": "Avg duration",
      "workflows.lastRun": "Last run",
      "workflows.noRunsYet": "No runs yet",
      "workflows.executionHistory": "Execution history",
      "workflows.loadingExecutions": "Loading executions...",
      "workflows.noExecutionsYet": "No executions yet.",
      "workflows.steps": "Steps",
      "workflows.loadingStats": "Loading stats...",
      "workflows.endpoint": "Endpoint",
      "workflows.deleteConfirm":
        "Are you sure you want to delete this workflow?",
      "workflows.deleteFailed": "Failed to delete workflow. Please try again.",

      // Workflow Editor
      "editor.title": "Workflow Editor",
      "editor.description": "Build and configure your automation flow.",
      "editor.workflowName": "Workflow name",
      "editor.active": "Active",
      "editor.trigger": "Trigger",
      "editor.notSet": "Not set",
      "editor.notConnected": "Not connected",
      "editor.saving": "Saving...",
      "editor.save": "Save",
      "editor.saveFailed": "Save failed",
      "editor.loadFailed": "Load failed",
      "editor.blocks": "Blocks",
      "editor.blockDetails": "Block details",
      "editor.addToCanvas": "Add to canvas",
      "editor.addedToCanvas": "Added to canvas.",
      "editor.tipDrag": "Tip: drag to place it precisely.",
      "editor.multiSelectHint":
        "Tip: Hold Shift and click to select multiple blocks at once",
      "editor.mobileHint":
        'Open the blocks menu to drag blocks onto the canvas or tap a block and use "Add to canvas".',
      "editor.clickBlock":
        "Click a block to see what it does and how to configure it.",
      "editor.nodeSettings": "Node settings",
      "editor.delete": "Delete",
      "editor.selectNode": "Select a node to edit its settings.",
      "editor.aboutBlock": "About this block",
      "editor.configureBlock":
        "Configure this block to control how it behaves.",
      "editor.webhookUrl": "Webhook URL",
      "editor.saveToGenerateWebhook": "Save to generate the webhook URL",
      "editor.generateEndpoint": "Generate endpoint",
      "editor.savingCreatesUrl":
        "Saving creates a stable URL for this trigger.",
      "editor.cronExpression": "Cron expression",
      "editor.timezone": "Timezone",
      "editor.inboundEmailEndpoint": "Inbound email endpoint",
      "editor.saveToGenerateEmail": "Save to generate the inbound endpoint",
      "editor.saveOnceForUrl": "Save once to get the inbound URL.",
      "editor.configureEmailProvider":
        "Configure your inbound email provider to POST to this URL.",
      "editor.url": "URL",
      "editor.method": "Method",
      "editor.headers": "Headers (JSON)",
      "editor.body": "Body (JSON or text)",
      "editor.to": "To",
      "editor.subject": "Subject",
      "editor.html": "HTML",
      "editor.text": "Text",
      "editor.botToken": "Bot token",
      "editor.chatId": "Chat ID",
      "editor.message": "Message",
      "editor.parseMode": "Parse mode",
      "editor.model": "Model",
      "editor.operation": "Operation",
      "editor.args": "Args (JSON)",
      "editor.expression": "Expression",
      "editor.mapping": "Mapping (JSON)",
      "editor.errorHandling": "Error handling",
      "editor.retryCount": "Retry count",
      "editor.retryDelay": "Retry delay (ms)",
      "editor.onError": "On error",
      "editor.notifyEmail": "Notify email",
      "editor.workflowNameRequired": "Workflow name is required.",
      "editor.addTriggerBeforeSaving": "Add a trigger block before saving.",
      "editor.saved": "Saved",
      "editor.workflowUpdated": "Workflow updated.",
      "editor.workflowSaved": "Workflow saved.",

      // Palette blocks translations
      "editor.palette.webhook.summary":
        "Incoming HTTP request triggers the workflow.",
      "editor.palette.webhook.details":
        "Expose a webhook endpoint and start the flow when data is posted.",
      "editor.palette.webhook.tip1": "Use JSON payloads from external apps.",
      "editor.palette.webhook.tip2": "Save once to generate the URL.",
      "editor.palette.schedule.summary": "Run the workflow on a cron schedule.",
      "editor.palette.schedule.details":
        "Define a cron expression and timezone to trigger automatically.",
      "editor.palette.schedule.tip1": "Example: */5 * * * *",
      "editor.palette.schedule.tip2": "Timezone defaults to UTC.",
      "editor.palette.email-trigger.summary":
        "Trigger when an inbound email arrives.",
      "editor.palette.email-trigger.details":
        "Point your inbound email provider to the generated endpoint.",
      "editor.palette.email-trigger.tip1": "Providers can POST email payloads.",
      "editor.palette.email-trigger.tip2": "Save once to get the URL.",
      "editor.palette.http-request.summary": "Send an HTTP request to an API.",
      "editor.palette.http-request.details":
        "Configure method, headers, and body. The response becomes the next step input.",
      "editor.palette.http-request.tip1": "Use output from previous steps.",
      "editor.palette.http-request.tip2": "Timeout defaults to 15s.",
      "editor.palette.email-action.summary": "Send an email notification.",
      "editor.palette.email-action.details":
        "Uses your configured email service with HTML or text content.",
      "editor.palette.email-action.tip1": "Provide recipient and subject.",
      "editor.palette.email-action.tip2": "HTML is optional.",
      "editor.palette.telegram.summary": "Send a message to Telegram.",
      "editor.palette.telegram.details":
        "Requires a bot token and the target chat ID.",
      "editor.palette.telegram.tip1": "Create a bot via BotFather.",
      "editor.palette.telegram.tip2": "Use the chat ID of your target.",
      "editor.palette.database.summary": "Run a database operation.",
      "editor.palette.database.details":
        "Executes a Prisma operation against your database.",
      "editor.palette.database.tip1": "Model name matches Prisma client.",
      "editor.palette.database.tip2": "Args must be valid JSON.",
      "editor.palette.transformation.summary":
        "Transform or filter the payload.",
      "editor.palette.transformation.details":
        "Use an expression or mapping to shape data between steps.",
      "editor.palette.transformation.tip1": "Expression returns new payload.",
      "editor.palette.transformation.tip2": "Mapping can pick fields by path.",
      "editor.palette.role.trigger": "trigger",
      "editor.palette.role.action": "action",

      // Telegram action
      "editor.telegram.botTokenHint": "Get it from",
      "editor.telegram.chatIdHint": "Get your ID from",
      "editor.telegram.messagePlaceholder":
        "✅ Workflow completed successfully!",
      "editor.telegram.messageHint":
        "Use *bold*, _italic_, `code` for Markdown formatting",
      "editor.telegram.parseModeHint":
        "Markdown — *bold* _italic_, HTML — <b>bold</b> <i>italic</i>",
      "editor.telegram.preview": "Preview",
      "editor.telegram.testSend": "Send test",
      "editor.telegram.sending": "Sending...",
      "editor.telegram.testMessage": "🧪 Test message from workflow editor",
      "editor.telegram.testSuccess": "✓ Message sent!",
      "editor.telegram.testFailed": "Failed to send message",

      // HTTP Request action
      "editor.http.urlHint":
        "Full URL including https://. Can include query params.",
      "editor.http.methodHint":
        "GET — fetch data, POST — send data, PUT — update, DELETE — remove",
      "editor.http.headersPlaceholder":
        '{"Authorization": "Bearer token", "X-Custom": "value"}',
      "editor.http.headersHint":
        "JSON object with HTTP headers. Content-Type is added automatically.",
      "editor.http.bodyPlaceholder":
        '{"key": "value"} or leave empty to forward previous step data',
      "editor.http.bodyHint":
        "Leave empty to automatically send data from the previous step.",
      "editor.http.testRequest": "Test request",
      "editor.http.testing": "Testing...",
      "editor.http.success": "Success",
      "editor.http.failed": "Failed",

      // Email action
      "editor.email.toHint":
        "Recipient email address. You can use data from previous steps.",
      "editor.email.subjectPlaceholder": "Workflow notification",
      "editor.email.subjectHint": "Email subject line.",
      "editor.email.contentType": "Content type",
      "editor.email.both": "Both",
      "editor.email.htmlPlaceholder":
        "<h1>Hello!</h1>\n<p>Your workflow completed successfully.</p>",
      "editor.email.htmlHint":
        "HTML content with formatting. Use tags like <b>, <p>, <a>.",
      "editor.email.textPlaceholder":
        "Hello!\n\nYour workflow completed successfully.",
      "editor.email.textHint":
        "Plain text fallback for email clients that don't support HTML.",
      "editor.email.autoContentHint":
        "💡 If content is empty, the data from the previous step will be sent as JSON automatically.",
      "editor.email.provider": "Email provider",
      "editor.email.gmailTitle": "Gmail SMTP",
      "editor.email.gmailDesc":
        "Send emails directly from your Gmail account using SMTP. Free, no limits. Requires an App Password.",
      "editor.email.getAppPassword": "Get App Password",
      "editor.email.gmailSettings": "Gmail SMTP Settings",
      "editor.email.gmailEmail": "Gmail address",
      "editor.email.appPassword": "App Password",
      "editor.email.appPasswordHint":
        "16-character password from Google. NOT your regular password.",
      "editor.email.sendgridTitle": "SendGrid",
      "editor.email.sendgridDesc":
        "Professional email service. Free tier: 100 emails/day. Great deliverability.",
      "editor.email.getSendGridKey": "Get API Key",
      "editor.email.sendgridSettings": "SendGrid Settings",
      "editor.email.sendgridApiKey": "API Key",
      "editor.email.senderEmail": "Sender email",
      "editor.email.senderHint": "Must be verified in SendGrid.",
      "editor.email.resendTitle": "Resend",
      "editor.email.resendDesc":
        "Modern email API for developers. Free tier: 100 emails/day. Configured via .env.",
      "editor.email.getResendKey": "Get API Key",
      "editor.email.testConnection": "Test connection",
      "editor.email.testing": "Testing...",
      "editor.email.connectionSuccess": "✓ Connection successful!",
      "editor.email.sendTest": "Send test email",
      "editor.email.sending": "Sending...",
      "editor.email.sendSuccess": "✓ Email sent!",

      // Database action
      "editor.db.modelPlaceholder": "e.g., user, workflow, execution",
      "editor.db.modelHint":
        "Prisma model name in lowercase. Must match your schema.",
      "editor.db.argsHint":
        "Prisma query arguments as JSON. Format depends on operation.",
      "editor.db.exampleFor": "Example for",
      "editor.db.useTemplate": "← Use this template",
      "editor.db.autoDataHint":
        "💡 For 'create': if args is empty, data from the previous step is used as 'data' field.",
      "editor.db.opCreate": "Add new record",
      "editor.db.opFindMany": "Get multiple",
      "editor.db.opFindUnique": "Get one by ID",
      "editor.db.opUpdate": "Modify existing",
      "editor.db.opUpsert": "Create or update",
      "editor.db.opDelete": "Remove record",

      // Transformation action
      "editor.transform.mode": "Mode",
      "editor.transform.expression": "Expression",
      "editor.transform.mapping": "Mapping",
      "editor.transform.expressionPlaceholder": "input.user.name.toUpperCase()",
      "editor.transform.expressionHint":
        "JavaScript expression. 'input' contains data from previous step.",
      "editor.transform.examples": "Examples (click to use)",
      "editor.transform.mappingPlaceholder":
        '{\n  "userName": "input.user.name",\n  "userEmail": "input.user.email"\n}',
      "editor.transform.mappingHint":
        "JSON object mapping output fields to input paths.",
      "editor.transform.mappingBuilder": "Quick builder",
      "editor.transform.addField": "Add field",
      "editor.transform.dataFlowHint":
        "💡 Result of transformation becomes input for the next step. Use 'input' to access previous step data.",
      "editor.transform.exPassthrough": "Pass all data unchanged",
      "editor.transform.exExtract": "Extract nested field",
      "editor.transform.exTransform": "Create new object",
      "editor.transform.exFilter": "Filter array items",
      "editor.transform.exMath": "Calculate values",

      // Webhook Trigger
      "editor.webhook.howItWorks": "How it works",
      "editor.webhook.description":
        "External services send HTTP POST requests to your unique URL. The request body becomes input data for subsequent workflow steps.",
      "editor.webhook.urlHint":
        "Send POST requests to this URL with JSON body to trigger the workflow.",
      "editor.webhook.copy": "Copy",
      "editor.webhook.generate": "Generate URL",
      "editor.webhook.saveFirst":
        "Save workflow to generate your unique webhook URL",
      "editor.webhook.usageExamples": "Usage examples",
      "editor.webhook.dataFlowHint":
        "💡 JSON body from POST request becomes 'input' for the next step. Example: if you send {\"userId\": 123}, use input.userId in the next block.",

      // Schedule Trigger
      "editor.schedule.howItWorks": "How it works",
      "editor.schedule.description":
        "Workflow runs automatically based on cron schedule. Perfect for periodic tasks like reports, cleanups, or sync jobs.",
      "editor.schedule.cronHint":
        "Cron expression defines when workflow runs. Click presets below for common schedules.",
      "editor.schedule.cronFormat": "Cron format",
      "editor.schedule.minute": "minute",
      "editor.schedule.hour": "hour",
      "editor.schedule.dayMonth": "day of month",
      "editor.schedule.month": "month",
      "editor.schedule.dayWeek": "day of week",
      "editor.schedule.any": "any value",
      "editor.schedule.every5": "every 5 units",
      "editor.schedule.specific": "specific values",
      "editor.schedule.timezoneHint":
        "All times are calculated in this timezone. Click presets below.",
      "editor.schedule.dataFlowHint":
        "💡 Scheduled runs pass empty {} as input. Use Transformation or HTTP Request to fetch initial data.",

      // Email Trigger (IMAP Polling)
      "editor.emailTrigger.howItWorks": "How it works",
      "editor.emailTrigger.imapDescription":
        "Connect your email account directly. We'll check for new emails every 5 minutes and trigger workflow automatically.",
      "editor.emailTrigger.imapEmail": "Email Address",
      "editor.emailTrigger.imapEmailHint":
        "Your email address (Gmail, Mail.ru, Yandex, Yahoo, Outlook, etc.)",
      "editor.emailTrigger.imapPassword": "App Password",
      "editor.emailTrigger.appPasswordPlaceholder":
        "Your app password (not regular password)",
      "editor.emailTrigger.appPasswordHint":
        "Use an App Password, NOT your regular password. See instructions below.",
      "editor.emailTrigger.appPasswordTitle": "⚠️ How to create App Password",
      "editor.emailTrigger.createAppPassword": "Create App Password",
      "editor.emailTrigger.mailruInstructions":
        "Settings → Password & Security → App Passwords",
      "editor.emailTrigger.yandexInstructions":
        "Settings → Security → App Passwords",
      "editor.emailTrigger.advancedSettings": "⚙️ Advanced Settings",
      "editor.emailTrigger.imapServer": "IMAP Server",
      "editor.emailTrigger.autoDetect": "Auto-detect from email",
      "editor.emailTrigger.imapServerHint":
        "Leave empty for auto-detection (Gmail, Mail.ru, Yandex, etc.)",
      "editor.emailTrigger.imapPort": "IMAP Port",
      "editor.emailTrigger.folder": "Folder",
      "editor.emailTrigger.filterFrom": "Filter by Sender",
      "editor.emailTrigger.filterFromPlaceholder": "e.g., orders@example.com",
      "editor.emailTrigger.filterSubject": "Filter by Subject",
      "editor.emailTrigger.filterSubjectPlaceholder":
        "e.g., Order confirmation",
      "editor.emailTrigger.testConnection": "Test Connection",
      "editor.emailTrigger.testing": "Testing...",
      "editor.emailTrigger.connectionSuccess": "✓ Connection successful!",
      "editor.emailTrigger.enterCredentials": "Enter email and password first",
      "editor.emailTrigger.supportedProviders": "Supported providers",
      "editor.emailTrigger.pollingInfo":
        "📬 Emails are checked every 5 minutes. New emails trigger workflow with email data (from, subject, body) as input.",

      // Auth
      "auth.welcomeBack": "Welcome back",
      "auth.signInDescription":
        "Sign in to manage your workflows and triggers.",
      "auth.createAccount": "Create your account",
      "auth.startBuilding": "Start building automations in minutes.",
      "auth.email": "Email",
      "auth.password": "Password",
      "auth.name": "Name",
      "auth.signIn": "Sign in",
      "auth.createAccountButton": "Create account",
      "auth.dontHaveAccount": "Don't have an account?",
      "auth.alreadyHaveAccount": "Already have an account?",
      "auth.createOne": "Create one",
      "auth.loginFailed": "Login failed",
      "auth.registrationFailed": "Registration failed",
      "auth.unableToLogin": "Unable to login.",
      "auth.unableToRegister": "Unable to register.",
      "auth.enterValidEmail": "Enter a valid email.",
      "auth.passwordMinLength": "Password must be at least 8 characters.",
      "auth.nameMinLength": "Name must be at least 2 characters.",
      "auth.nameMaxLength": "Name must be under 80 characters.",
      "auth.nameInvalidChars": "Use Russian or English letters only.",

      // Language
      "lang.english": "English",
      "lang.russian": "Русский",

      // Templates
      "editor.templates": "Templates",
      "templates.title": "Load template",
      "templates.confirmReplace":
        "This will replace your current workflow. Continue?",
      "templates.loaded": "Template loaded",
      "templates.webhookTelegram.name": "Webhook → Telegram",
      "templates.webhookTelegram.description":
        "Receive webhook requests and send notifications to Telegram",
      "templates.cronHttpEmail.name": "Schedule → HTTP → Email",
      "templates.cronHttpEmail.description":
        "Run daily API requests and send email reports",
      "templates.emailTransformDb.name": "Email → Transform → Database",
      "templates.emailTransformDb.description":
        "Process incoming emails and save data to database",
    },
    ru: {
      // Common
      "common.edit": "Редактировать",
      "common.delete": "Удалить",
      "common.save": "Сохранить",
      "common.cancel": "Отмена",
      "common.back": "← Назад",
      "common.loading": "Загрузка...",
      "common.user": "Пользователь",
      "common.logout": "Выйти",
      "common.signIn": "Войти",
      "common.new": "Новый",
      "common.home": "Главная",
      "common.editor": "Редактор",
      "common.close": "Закрыть",

      // Navigation
      "nav.home": "Главная",
      "nav.workflows": "Workflows",
      "nav.editor": "Редактор",
      "nav.newWorkflow": "Новый workflow",
      "nav.openWorkflowEditor": "Открыть редактор workflows",
      "nav.viewDashboard": "Просмотр панели",

      // Index page
      "index.title":
        "Автоматизируйте свой стек с помощью визуальных workflows.",
      "index.description":
        "Создавайте триггеры, связывайте действия и запускайте workflows за минуты. Подключайте Webhooks, Расписания и HTTP-запросы с надежным serverless выполнением.",
      "index.webhookTriggers": "Webhook триггеры",
      "index.webhookTooltip":
        "Запускайте workflows мгновенно через HTTP POST запросы на уникальные эндпоинты",
      "index.cronSchedules": "Cron расписания",
      "index.cronTooltip":
        "Запускайте workflows автоматически по расписанию (каждую минуту, час, день и т.д.)",
      "index.jsonFirstWorkflows": "JSON-first workflows",
      "index.jsonTooltip":
        "Workflows хранятся как JSON графы с полной историей выполнения и логами аудита",
      "index.fromTriggerToAction": "От триггера к действию",
      "index.fromTriggerToActionDesc":
        "Проектируйте потоки визуально, затем сохраняйте граф как JSONB с полной историей выполнения.",
      "index.reliableExecution": "Надежное выполнение",
      "index.reliableExecutionDesc":
        "QStash обрабатывает очереди и повторы, пока runner изолирует каждый запуск workflow.",
      "index.auditReadyLogs": "Готовые к аудиту логи",
      "index.auditReadyLogsDesc":
        "Пошаговое логирование, тайминги и результаты остаются доступными для каждого запуска.",
      "index.screenshotsTitle": "Скриншоты интерфейса",
      "index.screenshotEditorTitle": "Редактор workflow",
      "index.screenshotDetailsTitle": "Детали",
      "index.screenshotLogsTitle": "Логи аудита",

      // Workflows page
      "workflows.title": "Workflows",
      "workflows.description":
        "Отслеживайте активность, производительность и недавние выполнения.",
      "workflows.newWorkflow": "Новый workflow",
      "workflows.workflowList": "Список workflows",
      "workflows.loadingWorkflows": "Загрузка workflows...",
      "workflows.selectWorkflow": "Выберите workflow",
      "workflows.overview": "Обзор",
      "workflows.triggerType": "Тип триггера",
      "workflows.lastUpdated": "Последнее обновление",
      "workflows.updated": "Обновлен",
      "workflows.created": "Создан",
      "workflows.totalRuns": "Всего запусков",
      "workflows.successRate": "Процент успеха",
      "workflows.avgDuration": "Средняя длительность",
      "workflows.lastRun": "Последний запуск",
      "workflows.noRunsYet": "Запусков пока нет",
      "workflows.executionHistory": "История выполнений",
      "workflows.loadingExecutions": "Загрузка выполнений...",
      "workflows.noExecutionsYet": "Выполнений пока нет.",
      "workflows.steps": "Шаги",
      "workflows.loadingStats": "Загрузка статистики...",
      "workflows.endpoint": "Эндпоинт",
      "workflows.deleteConfirm":
        "Вы уверены, что хотите удалить этот workflow?",
      "workflows.deleteFailed":
        "Не удалось удалить workflow. Попробуйте еще раз.",

      // Workflow Editor
      "editor.title": "Редактор Workflow",
      "editor.description":
        "Создавайте и настраивайте свой поток автоматизации.",
      "editor.workflowName": "Имя workflow",
      "editor.active": "Активен",
      "editor.trigger": "Триггер",
      "editor.notSet": "Не установлен",
      "editor.notConnected": "Не подключен",
      "editor.saving": "Сохранение...",
      "editor.save": "Сохранить",
      "editor.saveFailed": "Ошибка сохранения",
      "editor.loadFailed": "Ошибка загрузки",
      "editor.blocks": "Блоки",
      "editor.blockDetails": "Детали блока",
      "editor.addToCanvas": "Добавить на холст",
      "editor.addedToCanvas": "Добавлено на холст.",
      "editor.tipDrag": "Подсказка: перетащите для точного размещения.",
      "editor.multiSelectHint":
        "Подсказка: Удерживайте Shift и кликайте для выделения нескольких блоков",
      "editor.mobileHint":
        "Откройте меню блоков, перетащите блоки на холст или нажмите «Добавить на холст» в деталях блока.",
      "editor.clickBlock":
        "Нажмите на блок, чтобы увидеть, что он делает и как его настроить.",
      "editor.nodeSettings": "Настройки узла",
      "editor.delete": "Удалить",
      "editor.selectNode": "Выберите узел для редактирования его настроек.",
      "editor.aboutBlock": "О блоке",
      "editor.configureBlock":
        "Настройте этот блок, чтобы контролировать его поведение.",
      "editor.webhookUrl": "Webhook URL",
      "editor.saveToGenerateWebhook":
        "Сохраните, чтобы сгенерировать webhook URL",
      "editor.generateEndpoint": "Сгенерировать endpoint",
      "editor.savingCreatesUrl":
        "Сохранение создает стабильный URL для этого триггера.",
      "editor.cronExpression": "Cron выражение",
      "editor.timezone": "Часовой пояс",
      "editor.inboundEmailEndpoint": "Endpoint входящей почты",
      "editor.saveToGenerateEmail": "Сохраните, чтобы сгенерировать endpoint",
      "editor.saveOnceForUrl": "Сохраните один раз, чтобы получить URL.",
      "editor.configureEmailProvider":
        "Настройте ваш провайдер входящей почты для отправки POST на этот URL.",
      "editor.url": "URL",
      "editor.method": "Метод",
      "editor.headers": "Заголовки (JSON)",
      "editor.body": "Тело (JSON или текст)",
      "editor.to": "Кому",
      "editor.subject": "Тема",
      "editor.html": "HTML",
      "editor.text": "Текст",
      "editor.botToken": "Токен бота",
      "editor.chatId": "ID чата",
      "editor.message": "Сообщение",
      "editor.parseMode": "Режим парсинга",
      "editor.model": "Модель",
      "editor.operation": "Операция",
      "editor.args": "Аргументы (JSON)",
      "editor.expression": "Выражение",
      "editor.mapping": "Маппинг (JSON)",
      "editor.errorHandling": "Обработка ошибок",
      "editor.retryCount": "Количество повторов",
      "editor.retryDelay": "Задержка повтора (мс)",
      "editor.onError": "При ошибке",
      "editor.notifyEmail": "Email для уведомлений",
      "editor.workflowNameRequired": "Имя workflow обязательно.",
      "editor.addTriggerBeforeSaving":
        "Добавьте блок триггера перед сохранением.",
      "editor.saved": "Сохранено",
      "editor.workflowUpdated": "Workflow обновлен.",
      "editor.workflowSaved": "Workflow сохранен.",

      // Palette blocks translations
      "editor.palette.webhook.summary":
        "Входящий HTTP-запрос запускает workflow.",
      "editor.palette.webhook.details":
        "Предоставьте webhook endpoint и запустите поток при отправке данных.",
      "editor.palette.webhook.tip1":
        "Используйте JSON payloads из внешних приложений.",
      "editor.palette.webhook.tip2":
        "Сохраните один раз, чтобы сгенерировать URL.",
      "editor.palette.schedule.summary":
        "Запускайте workflow по cron расписанию.",
      "editor.palette.schedule.details":
        "Определите cron выражение и часовой пояс для автоматического запуска.",
      "editor.palette.schedule.tip1": "Пример: */5 * * * *",
      "editor.palette.schedule.tip2": "Часовой пояс по умолчанию UTC.",
      "editor.palette.email-trigger.summary":
        "Запуск при получении входящего email.",
      "editor.palette.email-trigger.details":
        "Направьте вашего провайдера входящей почты на сгенерированный endpoint.",
      "editor.palette.email-trigger.tip1":
        "Провайдеры могут отправлять POST запросы с email payloads.",
      "editor.palette.email-trigger.tip2":
        "Сохраните один раз, чтобы получить URL.",
      "editor.palette.http-request.summary": "Отправьте HTTP-запрос к API.",
      "editor.palette.http-request.details":
        "Настройте метод, заголовки и тело. Ответ становится входными данными следующего шага.",
      "editor.palette.http-request.tip1": "Используйте вывод предыдущих шагов.",
      "editor.palette.http-request.tip2": "Таймаут по умолчанию 15 секунд.",
      "editor.palette.email-action.summary": "Отправьте email уведомление.",
      "editor.palette.email-action.details":
        "Использует настроенный email сервис с HTML или текстовым содержимым.",
      "editor.palette.email-action.tip1": "Укажите получателя и тему.",
      "editor.palette.email-action.tip2": "HTML опционален.",
      "editor.palette.telegram.summary": "Отправьте сообщение в Telegram.",
      "editor.palette.telegram.details":
        "Требуется токен бота и ID целевого чата.",
      "editor.palette.telegram.tip1": "Создайте бота через BotFather.",
      "editor.palette.telegram.tip2": "Используйте ID чата вашей цели.",
      "editor.palette.database.summary": "Выполните операцию с базой данных.",
      "editor.palette.database.details":
        "Выполняет операцию Prisma против вашей базы данных.",
      "editor.palette.database.tip1": "Имя модели соответствует Prisma client.",
      "editor.palette.database.tip2": "Аргументы должны быть валидным JSON.",
      "editor.palette.transformation.summary":
        "Преобразуйте или отфильтруйте payload.",
      "editor.palette.transformation.details":
        "Используйте выражение или маппинг для формирования данных между шагами.",
      "editor.palette.transformation.tip1":
        "Выражение возвращает новый payload.",
      "editor.palette.transformation.tip2":
        "Маппинг может выбирать поля по пути.",
      "editor.palette.role.trigger": "триггер",
      "editor.palette.role.action": "действие",

      // Telegram action
      "editor.telegram.botTokenHint": "Получите у",
      "editor.telegram.chatIdHint": "Узнайте свой ID у",
      "editor.telegram.messagePlaceholder": "✅ Workflow успешно выполнен!",
      "editor.telegram.messageHint":
        "Используйте *жирный*, _курсив_, `код` для Markdown",
      "editor.telegram.parseModeHint":
        "Markdown — *жирный* _курсив_, HTML — <b>жирный</b> <i>курсив</i>",
      "editor.telegram.preview": "Предпросмотр",
      "editor.telegram.testSend": "Тест",
      "editor.telegram.sending": "Отправка...",
      "editor.telegram.testMessage":
        "🧪 Тестовое сообщение из редактора workflows",
      "editor.telegram.testSuccess": "✓ Сообщение отправлено!",
      "editor.telegram.testFailed": "Не удалось отправить сообщение",

      // HTTP Request action
      "editor.http.urlHint":
        "Полный URL включая https://. Можно добавить параметры запроса.",
      "editor.http.methodHint":
        "GET — получить, POST — отправить, PUT — обновить, DELETE — удалить",
      "editor.http.headersPlaceholder":
        '{"Authorization": "Bearer token", "X-Custom": "значение"}',
      "editor.http.headersHint":
        "JSON объект с заголовками. Content-Type добавляется автоматически.",
      "editor.http.bodyPlaceholder":
        '{"key": "value"} или оставьте пустым для передачи данных предыдущего шага',
      "editor.http.bodyHint":
        "Оставьте пустым, чтобы автоматически отправить данные предыдущего шага.",
      "editor.http.testRequest": "Тест запроса",
      "editor.http.testing": "Тестирование...",
      "editor.http.success": "Успех",
      "editor.http.failed": "Ошибка",

      // Email action
      "editor.email.toHint":
        "Email получателя. Можно использовать данные из предыдущих шагов.",
      "editor.email.subjectPlaceholder": "Уведомление от workflow",
      "editor.email.subjectHint": "Тема письма.",
      "editor.email.contentType": "Тип контента",
      "editor.email.both": "Оба",
      "editor.email.htmlPlaceholder":
        "<h1>Привет!</h1>\n<p>Ваш workflow успешно выполнен.</p>",
      "editor.email.htmlHint":
        "HTML контент с форматированием. Используйте теги <b>, <p>, <a>.",
      "editor.email.textPlaceholder":
        "Привет!\n\nВаш workflow успешно выполнен.",
      "editor.email.textHint":
        "Текстовая версия для почтовых клиентов без поддержки HTML.",
      "editor.email.autoContentHint":
        "💡 Если контент пустой, данные предыдущего шага отправятся как JSON автоматически.",
      "editor.email.provider": "Провайдер email",
      "editor.email.gmailTitle": "Gmail SMTP",
      "editor.email.gmailDesc":
        "Отправляйте письма напрямую с вашего Gmail через SMTP. Бесплатно, без лимитов. Требует App Password.",
      "editor.email.getAppPassword": "Получить App Password",
      "editor.email.gmailSettings": "Настройки Gmail SMTP",
      "editor.email.gmailEmail": "Gmail адрес",
      "editor.email.appPassword": "App Password",
      "editor.email.appPasswordHint":
        "16-символьный пароль от Google. НЕ ваш обычный пароль.",
      "editor.email.sendgridTitle": "SendGrid",
      "editor.email.sendgridDesc":
        "Профессиональный email сервис. Бесплатно: 100 писем/день. Отличная доставляемость.",
      "editor.email.getSendGridKey": "Получить API Key",
      "editor.email.sendgridSettings": "Настройки SendGrid",
      "editor.email.sendgridApiKey": "API Key",
      "editor.email.senderEmail": "Email отправителя",
      "editor.email.senderHint": "Должен быть верифицирован в SendGrid.",
      "editor.email.resendTitle": "Resend",
      "editor.email.resendDesc":
        "Современный email API для разработчиков. Бесплатно: 100 писем/день. Настраивается через .env.",
      "editor.email.getResendKey": "Получить API Key",
      "editor.email.testConnection": "Проверить соединение",
      "editor.email.testing": "Проверка...",
      "editor.email.connectionSuccess": "✓ Соединение успешно!",
      "editor.email.sendTest": "Отправить тестовое письмо",
      "editor.email.sending": "Отправка...",
      "editor.email.sendSuccess": "✓ Письмо отправлено!",

      // Database action
      "editor.db.modelPlaceholder": "например: user, workflow, execution",
      "editor.db.modelHint":
        "Имя модели Prisma в нижнем регистре. Должно совпадать со схемой.",
      "editor.db.argsHint":
        "Аргументы запроса Prisma в формате JSON. Формат зависит от операции.",
      "editor.db.exampleFor": "Пример для",
      "editor.db.useTemplate": "← Использовать шаблон",
      "editor.db.autoDataHint":
        "💡 Для 'create': если args пустой, данные предыдущего шага используются как 'data'.",
      "editor.db.opCreate": "Создать запись",
      "editor.db.opFindMany": "Получить несколько",
      "editor.db.opFindUnique": "Найти по ID",
      "editor.db.opUpdate": "Обновить",
      "editor.db.opUpsert": "Создать или обновить",
      "editor.db.opDelete": "Удалить запись",

      // Transformation action
      "editor.transform.mode": "Режим",
      "editor.transform.expression": "Выражение",
      "editor.transform.mapping": "Маппинг",
      "editor.transform.expressionPlaceholder": "input.user.name.toUpperCase()",
      "editor.transform.expressionHint":
        "JavaScript выражение. 'input' содержит данные предыдущего шага.",
      "editor.transform.examples": "Примеры (нажмите для использования)",
      "editor.transform.mappingPlaceholder":
        '{\n  "userName": "input.user.name",\n  "userEmail": "input.user.email"\n}',
      "editor.transform.mappingHint":
        "JSON объект, сопоставляющий поля вывода с путями ввода.",
      "editor.transform.mappingBuilder": "Быстрый конструктор",
      "editor.transform.addField": "Добавить поле",
      "editor.transform.dataFlowHint":
        "💡 Результат трансформации становится входом следующего шага. Используйте 'input' для доступа к данным.",
      "editor.transform.exPassthrough": "Передать все данные без изменений",
      "editor.transform.exExtract": "Извлечь вложенное поле",
      "editor.transform.exTransform": "Создать новый объект",
      "editor.transform.exFilter": "Отфильтровать элементы массива",
      "editor.transform.exMath": "Вычислить значения",

      // Webhook Trigger
      "editor.webhook.howItWorks": "Как это работает",
      "editor.webhook.description":
        "Внешние сервисы отправляют HTTP POST запросы на ваш уникальный URL. Тело запроса становится входными данными для последующих шагов workflow.",
      "editor.webhook.urlHint":
        "Отправляйте POST запросы на этот URL с JSON телом для запуска workflow.",
      "editor.webhook.copy": "Копировать",
      "editor.webhook.generate": "Сгенерировать URL",
      "editor.webhook.saveFirst":
        "Сохраните workflow для генерации уникального webhook URL",
      "editor.webhook.usageExamples": "Примеры использования",
      "editor.webhook.dataFlowHint":
        "💡 JSON тело POST запроса становится 'input' для следующего шага. Например: если отправить {\"userId\": 123}, используйте input.userId в следующем блоке.",

      // Schedule Trigger
      "editor.schedule.howItWorks": "Как это работает",
      "editor.schedule.description":
        "Workflow запускается автоматически по cron расписанию. Идеально для периодических задач: отчёты, очистка, синхронизация.",
      "editor.schedule.cronHint":
        "Cron выражение определяет когда запускается workflow. Нажмите на пресеты ниже для частых вариантов.",
      "editor.schedule.cronFormat": "Формат Cron",
      "editor.schedule.minute": "минута",
      "editor.schedule.hour": "час",
      "editor.schedule.dayMonth": "день месяца",
      "editor.schedule.month": "месяц",
      "editor.schedule.dayWeek": "день недели",
      "editor.schedule.any": "любое значение",
      "editor.schedule.every5": "каждые 5 единиц",
      "editor.schedule.specific": "конкретные значения",
      "editor.schedule.timezoneHint":
        "Всё время рассчитывается в этом часовом поясе. Нажмите на пресеты ниже.",
      "editor.schedule.dataFlowHint":
        "💡 Запуски по расписанию передают пустой {} как input. Используйте Transformation или HTTP Request для получения начальных данных.",

      // Email Trigger (IMAP Polling)
      "editor.emailTrigger.howItWorks": "Как это работает",
      "editor.emailTrigger.imapDescription":
        "Подключите свою почту напрямую. Мы проверяем новые письма каждые 5 минут и автоматически запускаем workflow.",
      "editor.emailTrigger.imapEmail": "Email адрес",
      "editor.emailTrigger.imapEmailHint":
        "Ваш email (Gmail, Mail.ru, Yandex, Yahoo, Outlook и др.)",
      "editor.emailTrigger.imapPassword": "Пароль приложения",
      "editor.emailTrigger.appPasswordPlaceholder":
        "Ваш пароль приложения (не обычный пароль)",
      "editor.emailTrigger.appPasswordHint":
        "Используйте Пароль приложения, НЕ обычный пароль. См. инструкции ниже.",
      "editor.emailTrigger.appPasswordTitle":
        "⚠️ Как создать Пароль приложения",
      "editor.emailTrigger.createAppPassword": "Создать пароль приложения",
      "editor.emailTrigger.mailruInstructions":
        "Настройки → Пароли и безопасность → Пароли приложений",
      "editor.emailTrigger.yandexInstructions":
        "Настройки → Безопасность → Пароли приложений",
      "editor.emailTrigger.advancedSettings": "⚙️ Расширенные настройки",
      "editor.emailTrigger.imapServer": "IMAP Сервер",
      "editor.emailTrigger.autoDetect": "Автоопределение по email",
      "editor.emailTrigger.imapServerHint":
        "Оставьте пустым для автоопределения (Gmail, Mail.ru, Yandex и др.)",
      "editor.emailTrigger.imapPort": "IMAP Порт",
      "editor.emailTrigger.folder": "Папка",
      "editor.emailTrigger.filterFrom": "Фильтр по отправителю",
      "editor.emailTrigger.filterFromPlaceholder": "напр., orders@example.com",
      "editor.emailTrigger.filterSubject": "Фильтр по теме",
      "editor.emailTrigger.filterSubjectPlaceholder":
        "напр., Подтверждение заказа",
      "editor.emailTrigger.testConnection": "Проверить подключение",
      "editor.emailTrigger.testing": "Проверка...",
      "editor.emailTrigger.connectionSuccess": "✓ Подключение успешно!",
      "editor.emailTrigger.enterCredentials": "Сначала введите email и пароль",
      "editor.emailTrigger.supportedProviders": "Поддерживаемые провайдеры",
      "editor.emailTrigger.pollingInfo":
        "📬 Почта проверяется каждые 5 минут. Новые письма запускают workflow с данными письма (от, тема, текст) как input.",

      // Auth
      "auth.welcomeBack": "Добро пожаловать",
      "auth.signInDescription":
        "Войдите, чтобы управлять своими workflows и триггерами.",
      "auth.createAccount": "Создайте аккаунт",
      "auth.startBuilding": "Начните создавать автоматизации за минуты.",
      "auth.email": "Email",
      "auth.password": "Пароль",
      "auth.name": "Имя",
      "auth.signIn": "Войти",
      "auth.createAccountButton": "Создать аккаунт",
      "auth.dontHaveAccount": "Нет аккаунта?",
      "auth.alreadyHaveAccount": "Уже есть аккаунт?",
      "auth.createOne": "Создать",
      "auth.loginFailed": "Ошибка входа",
      "auth.registrationFailed": "Ошибка регистрации",
      "auth.unableToLogin": "Не удалось войти.",
      "auth.unableToRegister": "Не удалось зарегистрироваться.",
      "auth.enterValidEmail": "Введите корректный email.",
      "auth.passwordMinLength": "Пароль должен содержать минимум 8 символов.",
      "auth.nameMinLength": "Имя должно содержать минимум 2 символа.",
      "auth.nameMaxLength": "Имя должно содержать не более 80 символов.",
      "auth.nameInvalidChars":
        "Используйте только русские или английские буквы.",

      // Language
      "lang.english": "English",
      "lang.russian": "Русский",

      // Templates
      "editor.templates": "Шаблоны",
      "templates.title": "Загрузить шаблон",
      "templates.confirmReplace": "Текущий workflow будет заменен. Продолжить?",
      "templates.loaded": "Шаблон загружен",
      "templates.webhookTelegram.name": "Webhook → Telegram",
      "templates.webhookTelegram.description":
        "Получайте webhook запросы и отправляйте уведомления в Telegram",
      "templates.cronHttpEmail.name": "Расписание → HTTP → Email",
      "templates.cronHttpEmail.description":
        "Запускайте ежедневные API запросы и отправляйте email отчеты",
      "templates.emailTransformDb.name": "Email → Трансформация → БД",
      "templates.emailTransformDb.description":
        "Обрабатывайте входящие письма и сохраняйте данные в базу",
    },
  };

  const t = (key: string): string => {
    const currentLocale = locale.value;
    return translations[currentLocale]?.[key] || key;
  };

  const setLocale = (newLocale: "en" | "ru") => {
    locale.value = newLocale;
    if (process.client) {
      localStorage.setItem("locale", newLocale);
    }
  };

  // Load locale from localStorage on client once per app instance
  if (process.client && !localeInitialized.value) {
    const savedLocale = localStorage.getItem("locale") as "en" | "ru" | null;
    if (savedLocale && (savedLocale === "en" || savedLocale === "ru")) {
      locale.value = savedLocale;
    }
    localeInitialized.value = true;
  }

  return {
    t,
    locale: readonly(locale),
    setLocale,
  };
};
