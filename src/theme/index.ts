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
        },
        Toast: {
            baseStyle: {
                container: {
                    borderRadius: '12px',
                    boxShadow: 'lg',
                    border: '1px solid',
                    borderColor: 'red.200',
                    padding: '10px 15px',
                    maxWidth: '400px',
                    width: '100%',
                },
                title: {
                    fontWeight: 'bold',
                    fontSize: 'md',
                    color: 'red.700',
                },
                description: {
                    fontSize: 'sm',
                    color: 'red.600',
                },
                icon: {
                    color: 'red.500',
                },
            },
            variants: {
                solid: {
                    container: {
                        bg: 'red.50',
                        borderColor: 'red.200',
                    }
                },
                subtle: {
                    container: {
                        bg: 'red.100',
                        borderColor: 'red.300',
                    }
                }
            },
            defaultProps: {
                variant: 'solid',
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
