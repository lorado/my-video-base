export class Notification {
  public text: string;
  public type: 'success' | 'danger' | 'warning' | 'info' = 'info';
  public _timeoutStart: number;
  public _timeoutRef;
  public closeAfter: number | null;
  public closeByClick: boolean;
  public onClose: Function;

  constructor(settings: {
    text: string,
    type?: 'success' | 'danger' | 'warning' | 'info',
    closeAfter?: number | null,
    onClose?: Function,
    closeByClick?: boolean
  }) {
    this.text = settings.text;
    this.type = settings.type;
    this.closeAfter = settings.closeAfter !== null && !settings.closeAfter ? 5000 : settings.closeAfter;
    this.onClose = settings.onClose;
    this.closeByClick = settings.closeByClick;
  }
}
