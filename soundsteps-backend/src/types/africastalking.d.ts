declare module 'africastalking' {
  interface ATInstance {
    SMS: {
      send(options: { to: string; message: string; from?: string }): Promise<any>;
    };
    VOICE: {
      call(options: { callFrom: string; callTo: string }): Promise<any>;
    };
    AIRTIME: {
      send(options: { recipients: Array<{ phoneNumber: string; currencyCode: string; amount: string }> }): Promise<any>;
    };
  }
  
  function africastalking(config: { apiKey: string; username: string }): ATInstance;
  export = africastalking;
}