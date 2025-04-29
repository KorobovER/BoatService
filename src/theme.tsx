import { extendTheme } from "@chakra-ui/react";

// Цветовая палитра приложения, адаптированная из Flutter стайл-гайда
const colors = {
  // Basic Colors
  basic: {
    grey900: "#1F1F1F",
    grey800: "#2E2E2E",
    grey700: "#272727",
    grey600: "#777777",
    grey300: "#B7B7B7",
    grey200: "#D2D2D2",
    grey100: "#F6F6F6",
    grey0: "#FFFFFF"
  },
  brand: {
    primaryOrange: "#DD6600",
    secondaryBlue: "#003F5A",
    primaryOrange26: "#DD660026"
  },
  system: {
    errorRed: "#DA0000",
    errorRedNew: "#A85555",
    warningYellow: "#FEA02F",
    successGreen: "#007A7B",
    error15: "#FEEEE",
    error: "#A85555"
  },
  bg: {
    success: "#E5F2F2",
    warning: "#FDF6ED",
    error: "#FEEEE",
    info: "#EFF4FB",
    orange: "#FCF0E5",
    mooringField: "#E4E4E4"
  },
  calendar: {
    todayBg: "#FAE8D9"
  },
  // Градиенты
  gradient: {
    orange: "linear-gradient(to right, #DD6600, #EF5457)",
    blue: "linear-gradient(to right, #003F5A, #165874)",
    dark: "linear-gradient(to right, #282B3B, #3B3B3B)",
    white: "linear-gradient(to right, #FFFFFF, #FFFFFF)",
    grey: "linear-gradient(to right, #B7B7B7, #D2D2D2)",
    red: "linear-gradient(to right, #DA0000, #B80202)"
  }
};

const disabledStyles = {
  _disabled: {
    backgroundColor: "ui.main",
  },
};

const theme = extendTheme({
  colors: {
    ...colors,
    ui: {
      main: colors.brand.primaryOrange,
      secondary: "#EF5457",
      success: colors.system.successGreen,
      danger: colors.system.errorRed,
      warning: colors.system.warningYellow,
      light: colors.basic.grey100,
      dark: "#1A202C",
      darkSlate: "#252D3D",
      dim: "#A0AEC0",
    },
  },
  
  space: {
    zero: 0,
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    "2xl": "32px",
    "3xl": "40px",
    "4xl": "48px",
    "5xl": "56px",
    full: "1000px",
  },

  styles: {
    global: {
      body: {
        bg: "ui.light", 
      },
    },
  },
  components: {
    Button: {
      variants: {
        primary: {
          backgroundColor: "ui.main",
          color: "ui.light",
          _hover: {
            backgroundColor: "white",
          },
          _disabled: {
            ...disabledStyles,
            _hover: {
              ...disabledStyles,
            },
          },
        },
        danger: {
          backgroundColor: "ui.danger",
          color: "ui.light",
          _hover: {
            backgroundColor: "white",
          },
        },
      },
    },
    Tabs: {
      variants: {
        enclosed: {
          tab: {
            _selected: {
              color: "ui.main",
            },
          },
        },
      },
    },
  },
});

export default theme;