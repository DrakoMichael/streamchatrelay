import liveChatSpam from "../spamGenerator/liveChatSpam.js";
import dataControl from "../dataControl/dataControl.js";

export default async function startUtilities(config) {
    if(config.type_ambience === "dev") {
        liveChatSpam();
    }
    if(config.data_analysis.enable_data_analysis) {
       dataControl(config);
    }
}