import { ChakraProvider } from '@chakra-ui/react';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './main';
import theme from './theme';
import './styles/global.css';

function App() {
    return (
        <ChakraProvider theme={theme}>
            <RouterProvider router={router} />
        </ChakraProvider>
    );
}

export default App;
