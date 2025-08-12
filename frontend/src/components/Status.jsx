import { useContext } from "react";
import { FaCheck } from "react-icons/fa";
import { ProgressContext } from '../ProgressContext';

const Status = () => {
    const { fileName, labelColumn, sensitiveColumn, sensitiveColumn2, problemTypeColumn } = useContext(ProgressContext);

    const Li = ({ name, value }) => {
        return (
            <li class="flex items-center">
                <FaCheck class="w-3.5 h-3.5 me-2 text-green-500 shrink-0" />
                {name}: <spna className="font-bold">&nbsp; {value}</spna>
            </li>
        )
    }

    return (
        <div className='text-white h-56'>
            <h2 class="mb-2 text-white">Current Statuse:</h2>
            <ul class="max-w-md space-y-1 h-96 text-sm text-gray-100 list-inside ">
                {fileName && (
                    <Li Dataset name="Dataset Uploaded" value={fileName} />
                )}
                {labelColumn && (
                    <Li Dataset name="Target value selected" value={labelColumn} />
                )}

                {sensitiveColumn && (
                    <Li Dataset name="Sensitive Feature(s) selected" value={` ${sensitiveColumn} ${sensitiveColumn2 ? sensitiveColumn2 : sensitiveColumn}`} />
                )}

                {problemTypeColumn && (
                    <Li Dataset name="Problem Type selected" value={problemTypeColumn} />
                )}
            </ul>
        </div>
    )
}


export default Status
