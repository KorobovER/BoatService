import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MooringBallsService } from '../../client'; // Импортируем сервис

const MooringBallsList: React.FC = () => {
    // Используем useQuery для выполнения запроса
    const {
        data: mooringBalls,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ['mooringBalls'], // Уникальный ключ для запроса
        queryFn: () =>
            MooringBallsService.readMooringBalls({
                skip: 0,
                limit: 100,
                startDate: '2025-02-03', // Пример даты начала
                daysLookahead: 7, // Пример количества дней
            }).then((response) => response), // Обрабатываем ответ
    });

    // Отображение состояния загрузки
    if (isLoading) {
        return <div>Loading...</div>;
    }

    // Отображение ошибки
    if (isError) {
        return <div>Error: {error.message}</div>;
    }

    // Отображение данных
    return (
        <div>
            <h1>Mooring Balls</h1>
            <ul>
                {mooringBalls?.data.map((ball: any) => (
                    <li key={ball.ball_number}>
                        <strong>Ball Number:</strong> {ball.ball_number}
                        <br />
                        <strong>Marina UUID:</strong> {ball.marina_uuid}
                        <br />
                        <strong>Subregion:</strong> {ball.subregion}
                        <br />
                        <strong>Start Date:</strong> {ball.start_date}
                        <br />
                        <strong>Days Lookahead:</strong> {ball.days_lookahead}
                        <hr />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MooringBallsList;