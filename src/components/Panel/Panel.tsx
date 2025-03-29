import TableWeek from '../TableWeek/TableWeek';
import { Box } from '@chakra-ui/react';


const Panel: React.FC = () => {
    return (
        <>
            <Box m='auto' w='98%' bg='white' rounded='25px'>
                <TableWeek />
            </Box>
        </>
    )
}
export default Panel