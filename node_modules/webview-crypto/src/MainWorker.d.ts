export default class MainWorker {
    private sendToWebView;
    private debug;
    private toSend;
    private readyToSend;
    private messages;
    constructor(sendToWebView: (message: string) => void, debug?: boolean);
    get crypto(): Crypto;
    private get subtle();
    private getRandomValues;
    onWebViewMessage(message: any): void;
    private callMethod;
    private static uuid;
}
