import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
    components: {
        Popover: {
            baseStyle: {
                popper: {
                    outline: 'none !important',
                    boxShadow: 'none !important'
                }
            }
        }
    },
    styles: {
        global: {
            '[data-popper-reference-hidden]': {
                visibility: 'hidden',
                pointerEvents: 'none',
                outline: 'none !important'
            }
        }
    }
});

export default theme; 