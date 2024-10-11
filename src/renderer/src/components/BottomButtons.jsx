export default ({ l_onClick, r_onClick, l_disabled=false, r_disabled=false, l_content, r_content }) => (
    <div className="cid-button-row cid-button-row-horiz">
        <button className="cid-button cid-button-lg cid-button-secondary" onClick={l_onClick} disabled={l_disabled}>{l_content}</button>
        <button className="cid-button cid-button-lg cid-button-primary" onClick={r_onClick} disabled={r_disabled} >{r_content}</button>
    </div>
)