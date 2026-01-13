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
import { startValidation, startEncryption } from "../store/actions/workflow.action";
import BottomButtons from "../components/BottomButtons";

const getFileName = (filePath: string) => filePath.split(/[/\\]/).pop() || "";
const getFileType = (filePath: string) => filePath.split('.').pop()?.toUpperCase() || "file";

export const ProcessingSummary = () => {

  const { t } = useTranslation();
  const encryptionEnabled = useAppStore(s => !!s.config.data.post_processing?.encryption) || false;
  const outputFilePath = useAppStore(s => s.outputFilePath);
  const mappingFilePath = useAppStore(s => s.mappingFilePath);
  const encryptedFilePath = useAppStore(s => s.encryptedFilePath);
  const encryptError = useAppStore(s => s.encryptErrorMessage);

  return (
    <div className="processing-summary">
      <h2 className="titleText">{t("processingSummary title")}</h2>

      <section className="card" aria-labelledby="generated-files-title">
        <h3 id="generated-files-title">{t("processingSummary fileList")}:</h3>

        { outputFilePath ? <SummaryRow filePath={outputFilePath} showEncrypt={encryptionEnabled} /> : null }
        { encryptError ? <div className="error-row">
            <div className="popover-arrow"></div>
            <p className="error-text"><strong>{t("processingSummary encryptionError")}: </strong>{encryptError}</p>
            <p className="error-text"><strong>{t("processingSummary errorAction")}: </strong>{t("processingSummary encryptManually")}</p>
          </div> : null }

        { mappingFilePath ? <SummaryRow filePath={mappingFilePath} /> : null }

        { encryptionEnabled && encryptedFilePath
          ? <SummaryRow filePath={encryptedFilePath} showOpen={false} showReveal={true} />
          : null
        }
      </section>

      <BottomButtons
        l_content={t("processingSummary leftButton")}
        l_onClick={() => startValidation()}
        r_onClick={() => useAppStore.getState().backToMain()}
        r_content={t("processingSummary rightButton")}
      />

    </div>
  );
}

type SummaryRowProps = {
  filePath: string;
  showOpen?: boolean;
  showReveal?: boolean;
  showEncrypt?: boolean;
}

const SummaryRow = ({ filePath, showOpen=true, showReveal=false, showEncrypt=false }: SummaryRowProps) => {
  const [hasEncryptionStarted, setHasEncryptionStarted] = useState(false);
  const { t } = useTranslation();

  const fileName = getFileName(filePath);
  const fileType = getFileType(filePath);

  return (
    <div className="file-row" data-path={filePath}>
      <div className="file-icon" aria-hidden="true">{fileType}</div>
      <div className="file-info">
        <h3 className="file-name" title={fileName}>{fileName}</h3>
        <h4 className="file-path" title={filePath}>{filePath}</h4>
      </div>
      <div className="cid-button-row cid-button-row-vert">
        { showOpen
          ? <button
            className="cid-button cid-button-fit cid-button-secondary"
            data-action="open-excel"
            aria-label={`Open ${fileName} in Excel`}
            onClick={() => openOutputFile(filePath)}
          >
              {t("processingSummary openFile")}
            </button>
          : null
        }
        { showReveal
          ? <button
          className="cid-button cid-button-fit cid-button-tertiary"
          data-action="reveal"
          aria-label={`Reveal ${fileName} in folder`}
          onClick={() => revealInDirectory(filePath)}
        >
          {t("processingSummary openFolder")}
        </button>
          : null
        }

        { showEncrypt
          ? <button
            className="cid-button cid-button-fit cid-button-danger"
            data-action="reveal"
            aria-label={`Reveal ${fileName} in folder`}
            disabled={hasEncryptionStarted}
            onClick={() => {
              startEncryption(filePath);
              setHasEncryptionStarted(true);
            }}
          >
            Encrypt
          </button>
          : null
        }
        
      </div>
    </div>
  );
};

export default ProcessingSummary;