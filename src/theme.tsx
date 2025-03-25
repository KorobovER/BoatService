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
      light: "#F6F6F6", // Это ваш #F6F6F6
      dark: "#1A202C",
      darkSlate: "#252D3D",
      dim: "#A0AEC0",
    },
  },
  // ⬇️ Добавляем глобальные стили для body
  styles: {
    global: {
      body: {
        bg: "ui.light", // или просто "#F6F6F6"
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