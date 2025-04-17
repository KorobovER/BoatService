import { extendTheme } from "@chakra-ui/react";

const disabledStyles = {
  _disabled: {
    backgroundColor: "ui.main",
  },
};

const theme = extendTheme({
  colors: {
    ui: {
      main: "#DD6600",
      secondary: "#EF5457",
      success: "#007A7B",
      danger: "#DA0000",
      warning: "#FEA02F",
      light: "#F6F6F6", 
      dark: "#1A202C",
      darkSlate: "#252D3D",
      dim: "#A0AEC0",
    },
  },
  
  space: {
    zero: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    "2xl": 32,
    "3xl": 40,
    "4xl": 48,
    "5xl": 56,
    full: 1000,
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