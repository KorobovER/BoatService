import { Button, Flex, Text } from "@chakra-ui/react";

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
                    <svg
                        width="15"
                        height="22"
                        viewBox="0 0 15 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M6.96875 9.91992L5.20898 11.6797C5.00977 11.8789 4.64453 11.8789 4.44531 11.6797C4.24609 11.4805 4.24609 11.1152 4.44531 10.916L7.10156 8.25977C7.30078 8.06055 7.66602 8.06055 7.86523 8.25977L10.5215 10.916C10.7207 11.1152 10.7207 11.4805 10.5215 11.6797C10.3223 11.8789 9.95703 11.8789 9.75781 11.6797L8.03125 9.91992V13.9375C8.03125 14.2363 7.76562 14.4688 7.4668 14.4688C7.20117 14.4688 6.93555 14.2363 6.93555 13.9375L6.96875 9.91992ZM4.3125 2.25H10.6875V0.65625C10.6875 0.390625 10.9199 0.125 11.2188 0.125C11.4844 0.125 11.75 0.390625 11.75 0.65625V2.25H12.8125C13.9746 2.25 14.9375 3.21289 14.9375 4.375V15C14.9375 16.1953 13.9746 17.125 12.8125 17.125H2.1875C0.992188 17.125 0.0625 16.1953 0.0625 15V4.375C0.0625 3.21289 0.992188 2.25 2.1875 2.25H3.25V0.65625C3.25 0.390625 3.48242 0.125 3.78125 0.125C4.04688 0.125 4.3125 0.390625 4.3125 0.65625V2.25ZM1.125 15C1.125 15.5977 1.58984 16.0625 2.1875 16.0625H12.8125C13.377 16.0625 13.875 15.5977 13.875 15V6.5H1.125V15ZM1.125 4.375V5.4375H13.875V4.375C13.875 3.81055 13.377 3.3125 12.8125 3.3125H2.1875C1.58984 3.3125 1.125 3.81055 1.125 4.375Z"
                            fill="#1F1F1F"
                        />
                    </svg>
                </Button>
            </Flex>

            <Flex padding='8px 10px' alignItems="center"  gap='md' justifyContent='center'>
                <Button width='34px' height='34px' variant="unstyled" onClick={onPrevWeek} display="flex" alignItems="center" justifyContent="center">
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <rect width="24" height="24" rx="12" fill="white" />
                        <rect
                            x="0.5"
                            y="0.5"
                            width="23"
                            height="23"
                            rx="11.5"
                            stroke="var(--chakra-colors-basic-grey100)"
                        />
                        <path
                            d="M14.5 17.5L10 13C9.9 12.9 9.86 12.78 9.86 12.66C9.86 12.56 9.9 12.44 9.94 12.34L14.44 7.84C14.62 7.64 14.92 7.64 15.12 7.84C15.32 8.04 15.32 8.34 15.12 8.54L11.08 12.66L15.12 16.8C15.32 17 15.32 17.3 15.12 17.5C14.92 17.7 14.7 17.7 14.5 17.5Z"
                            fill="#777777"
                        />
                    </svg>
                </Button>

                <Text>{weekRange}</Text>

                <Button width='34px' height='34px' variant="unstyled" onClick={onNextWeek} display="flex" alignItems="center" justifyContent="center">
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <rect width="24" height="24" rx="12" fill="white" />
                        <rect
                            x="0.5"
                            y="0.5"
                            width="23"
                            height="23"
                            rx="11.5"
                            stroke="var(--chakra-colors-basic-grey100)"
                        />
                        <path
                            d="M9.5 7.84L14 12.34C14.1 12.44 14.14 12.56 14.14 12.66C14.14 12.78 14.1 12.9 14 13L9.5 17.5C9.3 17.7 9 17.7 8.8 17.5C8.6 17.3 8.6 17 8.8 16.8L12.84 12.66L8.8 8.54C8.6 8.34 8.6 8.04 8.8 7.84C9 7.64 9.3 7.64 9.5 7.84Z"
                            fill="#777777"
                        />
                    </svg>
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