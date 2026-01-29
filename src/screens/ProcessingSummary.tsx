/* ************************************************************************
*  Common Identifier Application
*  Copyright (C) 2026  World Food Programme
*  
*  This program is free software: you can redistribute it and/or modify
*  it under the terms of the GNU Affero General Public License as published by
*  the Free Software Foundation, either version 3 of the License, or
*  (at your option) any later version.
*  
*  This program is distributed in the hope that it will be useful,
*  but WITHOUT ANY WARRANTY; without even the implied warranty of
*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*  GNU Affero General Public License for more details.
*  
*  You should have received a copy of the GNU Affero General Public License
*  along with this program.  If not, see <http://www.gnu.org/licenses/>.
************************************************************************ */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { openOutputFile, revealInDirectory } from "../store/actions/system.action";
import { useAppStore } from "../store";
import { startEncryption, backToMain } from "../store/actions/workflow.action";
import BottomButtons from "../components/BottomButtons";

const getFileName = (filePath: string) => filePath.split(/[/\\]/).pop() || "";

export const ProcessingSummary = () => {

  const { t } = useTranslation();
  const encryptionEnabled = useAppStore(s => !!s.config.data.post_processing?.encryption) && !!useAppStore(s => s.userData?.signingKey) || false;
  const outputFilePath = useAppStore(s => s.outputFilePath);
  const mappingFilePath = useAppStore(s => s.mappingFilePath);
  const encryptedFilePath = useAppStore(s => s.encryptedFilePath);
  const encryptError = useAppStore(s => s.encryptErrorMessage);

  return (
    <div className="processing-summary">
      <h2 className="titleText">{t("processingSummary title")}</h2>

      <section className="card" aria-labelledby="generated-files-title">
        <div className="card-header">
          <h3 id="generated-files-title">{t("processingSummary fileList")}:</h3>
          <a href="#" onClick={e => {
            e.preventDefault();
            revealInDirectory(outputFilePath!);
          }} aria-label={t("processingSummary openFolder")}>{t("processingSummary openFolder")}</a>
        </div>

        { outputFilePath ? <SummaryRow filePath={outputFilePath} modality={ModalStyles.OUTPUT} showEncrypt={encryptionEnabled} encryptDone={!!encryptedFilePath || !!encryptError} /> : null }
        { encryptError ? <div className="error-row">
            <p className="error-text"><strong>{t("processingSummary encryptionError")}: </strong>{encryptError}</p>
            <p className="error-text"><strong>{t("processingSummary errorAction")}: </strong>{t("processingSummary encryptManually")}</p>
          </div> : null }

        { mappingFilePath ? <SummaryRow filePath={mappingFilePath} modality={ModalStyles.MAPPING} /> : null }

        { encryptionEnabled && encryptedFilePath
          ? <SummaryRow filePath={encryptedFilePath} modality={ModalStyles.ENCRYPTED} showOpen={false} showReveal={true} />
          : null
        }
      </section>

      <BottomButtons
        side="right"
        r_onClick={backToMain}
        r_content={t("processingSummary rightButton")}
      />

    </div>
  );
}

enum ModalStyles {
  OUTPUT="output",
  MAPPING="mapping",
  ENCRYPTED="encrypted"
}

type SummaryRowProps = {
  filePath: string;
  modality: ModalStyles;
  showOpen?: boolean;
  showReveal?: boolean;
  showEncrypt?: boolean;
  encryptDone?: boolean;
}

const SummaryRow = ({ filePath, modality, showOpen=true, showReveal=false, showEncrypt=false, encryptDone=false }: SummaryRowProps) => {
  const [hasEncryptionStarted, setHasEncryptionStarted] = useState(false);
  const { t } = useTranslation();

  const fileName = getFileName(filePath);

  return (
    <div className="file-row" data-modality={modality} data-path={filePath}>
      <div className="tooltip-wrapper">
        <div className={`modality-badge badge-${modality}`} aria-hidden="true">{modality}</div>
        <span id={`${modality}-tooltip`} className="tooltip-text" role="tooltip">{t(`processingSummary ${modality}Tooltip`)}</span>
      </div>
      <div className="file-info">
        <h3 className="file-name" title={fileName}>{fileName}</h3>
        <h4 className="file-path" title={filePath}>{filePath}</h4>
      </div>
      <div className="cid-button-row cid-button-row-vert">
        { showOpen && <button className="cid-button cid-button-fit cid-button-secondary" onClick={() => openOutputFile(filePath)}>{t("processingSummary openFile")}</button> }
        { showReveal && <button className="cid-button cid-button-fit cid-button-tertiary" onClick={() => revealInDirectory(filePath)}>{t("processingSummary openFolder")}</button> }
        { modality === ModalStyles.OUTPUT && showEncrypt && !encryptDone && (
          <button
            className="cid-button cid-button-fit cid-button-danger"
            data-action="encrypt"
            aria-label={`Encrypt ${fileName}`}
            disabled={hasEncryptionStarted}
            onClick={() => {
              startEncryption(filePath);
              setHasEncryptionStarted(true);
            }}
          >
            {
            hasEncryptionStarted && !encryptDone
              ? <div className="loaderWrapper">
                  <span className="loader"></span>
                </div>
              : "Encrypt"
            }
            </button>
        )}
      </div>
    </div>
  );
};

export default ProcessingSummary;