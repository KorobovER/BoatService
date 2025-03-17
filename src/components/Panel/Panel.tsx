import TableWeek from '../TableWeek/TableWeek';
import TableSwitch from '../TableSwitch/TableSwitch';
import "./Panel.css";


const Panel: React.FC = () => {
    return (
        <>
            <div className='panel-container'>
                <TableSwitch/>
                <TableWeek />
            </div>
        </>
    )
}
export default Panel