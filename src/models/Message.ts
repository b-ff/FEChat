import './Client'

const EMPTY_MESSAGE_TEXT = 'Empty message'

export default class Message {
    constructor (
        public senderId: string,
        public text: string,
        public date: Date 
    ) {}

    static build (dto: any): Message {
        return new Message(
            dto.senderId || null,
            dto.text || EMPTY_MESSAGE_TEXT,
            dto.date ? new Date(dto.date) : new Date()
        )
    }
}