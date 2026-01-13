/**
 * @typedef {Object} ChatMessage
 * @property {string} id - Unique message identifier
 * @property {string} sender - Username of the message sender
 * @property {string} content - Message text content
 * @property {number} timestamp - Unix timestamp of when message was sent
 * @property {string} [type] - Message type (e.g., 'text', 'system', 'notification')
 * @property {string} origin - Origin platform of the message
 * @property {boolean} [isEdited] - Whether the message has been edited
 **/ 

export default class ChatMessageInterface {
    constructor(id, sender, content, timestamp, type = 'text') {
        this.id = id;
        this.sender = sender;
        this.content = content;
        this.timestamp = timestamp;
        this.type = type;
        this.isEdited = false;
        this.origin = 'unknown';
    }

    static create(sender, content, type = 'text', origin = 'unknown') {
        return new ChatMessageInterface(
            crypto.randomUUID(),
            sender,
            content,
            Date.now(),
            type,
            origin = 'unknown'
        );
    };

    edit(newContent) {
        this.content = newContent;
        this.isEdited = true;
    };

    toJSON() {
        return {
            id: this.id,
            sender: this.sender,
            content: this.content,
            timestamp: this.timestamp,
            type: this.type,
            isEdited: this.isEdited,
            origin: this.origin
        };
    };
}
