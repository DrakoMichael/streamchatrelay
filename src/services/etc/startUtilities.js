import liveChatSpam from "../spamGenerator/liveChatSpam.js";

export default async function startUtilities(config) {
    if(config.type_ambience === "dev") {
        liveChatSpam();
    }
}