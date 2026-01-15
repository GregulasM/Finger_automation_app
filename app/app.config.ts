export default defineAppConfig({
  ui: {
    primary: 'orange',
    colors: {
      primary: 'orange',
      neutral: 'zinc'
    },
    input: {
      base: 'text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12',
      default: {
        size: 'md'
      }
    },
    textarea: {
      base: 'text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12',
    },
    select: {
      base: 'text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12',
    },
    selectMenu: {
      base: 'text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12',
      option: {
        base: 'text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12',
      }
    },
    button: {
      root: 'ring-0',
      base: 'focus:ring-0 focus:ring-offset-0',
      background: 'bg-zinc-800/70 backdrop-blur-lg opacity-90',
      color: {
        primary: {
          solid: 'bg-orange-500 text-zinc-950 hover:bg-orange-600 focus:ring-0',
          soft: 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 focus:ring-0',
          outline: 'border-orange-500/30 text-orange-500 hover:bg-orange-500/10 focus:ring-0'
        },
        neutral: {
          solid: 'bg-zinc-800/70 text-zinc-100 hover:bg-zinc-800/90 focus:ring-0',
          soft: 'bg-zinc-800/50 text-zinc-100 hover:bg-zinc-800/70 focus:ring-0',
          outline: 'border-orange-500/30 bg-zinc-800/70 text-zinc-100 hover:border-orange-500/70 hover:bg-zinc-800/90 focus:ring-0'
        }
      }
    },
    switch: {
      root: 'ring-0',
      active: 'bg-orange-500',
      inactive: 'bg-zinc-700'
    },
    alert: {
      root: 'ring-0',
      base: 'bg-zinc-800/70 border-orange-500/30 backdrop-blur-lg opacity-90',
      title: 'text-[7px] 4xs:text-[8px] 3xs:text-[9px] 2xs:text-[10px] xs:text-[11px] sm:text-sm md:text-md lg:text-md 2xl:text-lg 3xl:text-lg/6 4xl:text-2xl/8 5xl:text-3xl/10 font-bold',
      description: 'text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12',
      color: {
        red: {
          soft: 'bg-red-500/20 text-red-400 border-red-500/30',
        },
        green: {
          soft: 'bg-green-500/20 text-green-400 border-green-500/30',
        }
      }
    },
    badge: {
      root: 'ring-0',
      base: 'bg-zinc-800/70 border-orange-500/30 text-zinc-100 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12',
      color: {
        neutral: {
          soft: 'bg-zinc-800/70 text-zinc-100 border-orange-500/30'
        },
        green: {
          soft: 'bg-green-500/20 text-green-400 border-green-500/30'
        },
        red: {
          soft: 'bg-red-500/20 text-red-400 border-red-500/30'
        },
        amber: {
          soft: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
        },
        blue: {
          soft: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
        }
      }
    },
    form: {
      wrapper: 'space-y-1',
      label: {
        base: 'text-zinc-100 font-semibold text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold',
        required: 'text-zinc-100'
      },
      help: {
        base: 'text-zinc-100 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12'
      },
      error: {
        base: 'text-red-400 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12'
      }
    },
    toast: {
      title: 'text-zinc-100 text-[7px] 4xs:text-[8px] 3xs:text-[9px] 2xs:text-[10px] xs:text-[11px] sm:text-sm md:text-md lg:text-md 2xl:text-lg 3xl:text-lg/6 4xl:text-2xl/8 5xl:text-3xl/10 font-bold',
      description: 'text-zinc-100/80 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12',
      background: 'bg-zinc-800 border-orange-500/30',
    },
  }
})
