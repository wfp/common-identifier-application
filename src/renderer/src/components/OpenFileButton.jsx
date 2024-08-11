import { useAppStore } from "../store";

function OpenFileButton({label}) {
    const preProcessFileOpenDialog = useAppStore(store => store.preProcessFileOpenDialog);


    return (
        <button className="openFile bigButton" onClick={preProcessFileOpenDialog}>
            {label}
        </button>
    )
}

export default OpenFileButton;