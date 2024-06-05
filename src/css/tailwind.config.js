const plugin = require("tailwindcss/plugin");
const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    colors: Object.assign({}, colors, {
      antPrimary: "#1890ff",
      antDanger: "#ff4d4f",
      antBorder: "#d9d9d9",
      antTableBorder: "#f0f0f0",
    }),
    extend: {
      boxShadow: {
        DEFAULT:
          "0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.02)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.02)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.01)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.01)",
        // https://getcssscan.com/css-box-shadow-examples
        custom1:
          "rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px",
        custom2: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
        custom3: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
      },
      keyframes: {
        changeColor: {
          "0%": { color: "inherit" },
          "100%": { color: "#1890ff" },
        },
      },
      animation: {
        changeColor: "changeColor 500ms forwards",
      },
      outline: {
        blue: "2px solid rgba(0, 112, 244, 0.5)",
      },
      fontFamily: {
        primary: ["Nunito", "sans-serif"],
        // secondary: ["Lato", "sans-serif"],
        // tertiary: ["Aleo", "sans-serif"],
        // quaternary: ["Muli", "sans-serif"],
      },
      fontSize: {
        xxs: ["0.65rem", { lineHeight: "1.5" }],
        xs: ["0.75rem", { lineHeight: "1.5" }],
        xs2: ["0.8rem", { lineHeight: "1.3" }],
        xs3: ["0.85rem", { lineHeight: "1.3" }],
        sm: ["0.875rem", { lineHeight: "1.5715" }],
        sm2: ["0.95rem", { lineHeight: "1.5715" }],
        base: ["1rem", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
        lg: ["1.125rem", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
        xl: ["1.25rem", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
        "2xl": ["1.5rem", { lineHeight: "1.33", letterSpacing: "-0.01em" }],
        "3xl": ["1.7rem", { lineHeight: "1.33", letterSpacing: "-0.01em" }],
        "4xl": ["2.25rem", { lineHeight: "1.25", letterSpacing: "-0.02em" }],
        "5xl": ["3rem", { lineHeight: "1.25", letterSpacing: "-0.02em" }],
        "6xl": ["3.75rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
      },
      screens: {
        xxs: "360px",
        xs: "480px",
      },
      borderWidth: {
        3: "3px",
      },
      minWidth: {
        36: "9rem",
        44: "11rem",
        56: "14rem",
        60: "15rem",
        72: "18rem",
        80: "20rem",
      },
      maxWidth: {
        "3xl": "32.5rem", // 520px
        "8xl": "88rem",
        "9xl": "96rem",
      },
      zIndex: {
        // https://getbootstrap.com/docs/5.0/layout/z-index/

        // Ant design z-index
        // node_modules\antd\lib\style\themes\variable.less
        /**
          @zindex-badge: auto;
          @zindex-table-fixed: 2;
          @zindex-affix: 10;
          @zindex-back-top: 10;
          @zindex-picker-panel: 10;
          @zindex-popup-close: 10;
          @zindex-modal: 1000;
          @zindex-modal-mask: 1000;
          @zindex-message: 1010;
          @zindex-notification: 1010;
          @zindex-popover: 1030;
          @zindex-dropdown: 1050; -> z-1140
          @zindex-picker: 1050; // table filter (+ search) < fixed header (1100)
          @zindex-popoconfirm: 1060;
          @zindex-tooltip: 1070;
          @zindex-image: 1080;
        */
        60: "60",
        1100: "1100", // fixed - Ex: header
        1110: "1110", // modal + modal-mask
        1120: "1120", // message + notification
        1130: "1130", // popover
        1140: "1140", // dropdown + select
        1150: "1150", // picker
        1160: "1160", // popoconfirm
        1170: "1170", // tooltip
        1180: "1180", //
        1190: "1190", // layer - Ex: loading
      },
    },
  },
  plugins: [
    // eslint-disable-next-line global-require
    require("@tailwindcss/forms"),
    require("@tailwindcss/line-clamp"),
    // add custom variant for expanding sidebar
    plugin(({ addVariant, e }) => {
      addVariant("sidebar-expanded", ({ modifySelectors, separator }) => {
        modifySelectors(
          ({ className }) =>
            `.sidebar-expanded .${e(
              `sidebar-expanded${separator}${className}`
            )}`
        );
      });
    }),
  ],
};
