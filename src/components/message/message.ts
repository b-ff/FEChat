import './message.scss'
const template = require('./message.pug')()

import Message from '../../models/Message'

const QUOTE = '&quot;'

export default class MessageComponent extends HTMLElement {
    public message: Message

    constructor () {
        super()
        this.classList.add('message')
    }

    get template (): string {
        return template
    }

    render (): void {
        this.innerHTML = Object.keys(this.message)
            .reduce((tpl: string, key: string): string => {
                return tpl.replace(`{{${key}}}`, this.formatMessageFieldOutput(this.message, key))
            }, this.template)
    }

    formatMessageFieldOutput (message: Message, fieldKey: string): string {
        const formatters = this.getFormatters()
        if (message[fieldKey]) {
            if (formatters[fieldKey]) {
                return formatters[fieldKey](message[fieldKey])
            } else {
                return message[fieldKey]
            }
        }

        return null
    }

    getFormatters (): any {
        return {
            senderId: value => value,
            text: value => value,
            date: value => `${value.toLocaleDateString()} ${value.toLocaleTimeString()}`
        }
    }

    connectedCallback (): void {
        this.render()
    }

    static get observedAttributes (): string[] {
        return [
            'message'
        ];
    }

    attributeChangedCallback (attrName, oldVal, newVal): void {
        if (attrName === 'message') {
            this.message = Message.build(JSON.parse(newVal))
            this.render()
        }
    }
}

window.customElements.define('message-component', MessageComponent)