import TableWeek from '../TableWeek/TableWeek';
import "./Panel.css";


const Panel: React.FC = () => {
    return (
        <>
            <div className='panel-container'>
                <TableWeek />
            </div>
        </>
    )
}
export default Panel