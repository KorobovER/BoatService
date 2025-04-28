import { Button, Flex, Text } from "@chakra-ui/react";

import { FiChevronLeft, FiChevronRight, FiCalendar } from "react-icons/fi";

type TableView = 'month' | 'week' | 'day';

interface TableSwitchProps {
    onPrevWeek: () => void;
    onNextWeek: () => void;
    onToday: () => void;
    weekRange: string;
    currentView: TableView;
    onViewChange: (view: TableView) => void;
}

const TableSwitch: React.FC<TableSwitchProps> = ({
    onPrevWeek,
    onNextWeek,
    onToday,
    weekRange,
    currentView,
    onViewChange,
}) => {
    return (
        <Flex
            justifyContent="space-between"
            alignItems="center"
            width="100%"
            margin="auto"
        >
            <Flex width='240px'>
                <Button
                    display="flex"
                    alignItems="center"
                    border="1px solid var(--chakra-colors-basic-grey300)"
                    bg="white"
                    width='120px'
                    borderRadius="25px"
                    pl='lg'
                    pr='lg'
                    pt='sm'
                    pb='sm'
                    gap="10px"
                    fontSize="12px"
                    fontWeight="400"
                    onClick={onToday}
                >
                    Today
                    <FiCalendar />
                </Button>
            </Flex>

            <Flex padding='8px 10px' alignItems="center" gap='md' justifyContent='center'>
                <Button
                    width='34px'
                    height='34px'
                    minWidth='34px'
                    minHeight='34px'
                    variant="unstyled"
                    onClick={onPrevWeek}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    border="1px solid"
                    borderColor="basic.grey100"
                    borderRadius="full"
                >
                    <FiChevronLeft size={16} color="basic.grey600"/>
                </Button>

                <Text>{weekRange}</Text>

                <Button
                    width='34px'
                    height='34px'
                    minWidth='34px'
                    minHeight='34px'
                    variant="unstyled"
                    onClick={onNextWeek}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    border="1px solid"
                    borderColor="basic.grey100"
                    borderRadius="full"
                >
                    <FiChevronRight size={16} color="basic.grey600"/>
                </Button>
            </Flex>

            <Flex gap="10px">
                <Button
                    display="flex"
                    alignItems="center"
                    border="1px solid var(--chakra-colors-basic-grey300)"
                    borderRadius="full"
                    px="lg" 
                    py="sm"
                    bg={currentView === 'month' ? 'var(--chakra-colors-gradient-blue)' : 'white'}
                    color={currentView === 'month' ? 'white' : 'var(--chakra-colors-basic-grey700)'}
                    fontSize="12px"
                    fontWeight="400"
                    onClick={() => onViewChange('month')}
                >
                    Month
                </Button>
                <Button
                    display="flex"
                    alignItems="center"
                    border="1px solid var(--chakra-colors-basic-grey300)"
                    borderRadius="full"
                    px="lg" 
                    py="sm"
                    bg={currentView === 'week' ? 'var(--chakra-colors-gradient-blue)' : 'white'}
                    color={currentView === 'week' ? 'white' : 'var(--chakra-colors-basic-grey700)'}
                    fontSize="12px"
                    fontWeight="400"
                    onClick={() => onViewChange('week')}
                >
                    Week
                </Button>
                <Button
                    display="flex"
                    alignItems="center"
                    border="1px solid var(--chakra-colors-basic-grey300)"
                    borderRadius="full"
                    px="lg" 
                    py="sm"
                    bg={currentView === 'day' ? 'var(--chakra-colors-gradient-blue)' : 'white'}
                    color={currentView === 'day' ? 'white' : 'var(--chakra-colors-basic-grey700)'}
                    fontSize="12px"
                    fontWeight="400"
                    onClick={() => onViewChange('day')}
                >
                    Day
                </Button>
            </Flex>
        </Flex>
    );
};

export default TableSwitch;