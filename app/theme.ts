import { createTheme } from "@mantine/core";

const DEFAULT_TRANSITION_DURATION = 300;

export const theme = createTheme({
  components: {
    Modal: {
      defaultProps: {
        transitionProps: {
          duration: DEFAULT_TRANSITION_DURATION,
          transition: "fade",
        },
      },
    },
    Card: {
      defaultProps: {
        radius: "md",
      },
    },
    Button: {
      defaultProps: {
        styles: { root: { transition: "all 200ms ease" } },
      },
    },
    NavLink: {
      defaultProps: {
        styles: { root: { transition: "background-color 200ms ease" } },
      },
    },
  },
});
