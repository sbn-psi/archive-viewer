import { createMuiTheme } from '@material-ui/core/styles';

const Theme = createMuiTheme({
    palette: {
        primary: {
            main: "#0B4FA3",
            light: "#859ec8"
        },
        secondary: {
            light: "#ededed",
            main: "#c6c6c6",
            dark: "#646464"
        },
        error: {
            main: "#812517"
        }
    }
});

export default Theme;