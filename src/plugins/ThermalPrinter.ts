import { registerPlugin } from '@capacitor/core';

export interface ThermalPrinterPlugin {
    print(options: {
        ip: string;
        data: string;
    }): Promise<{ success: boolean; error?: string }>;

    discover(): Promise<{ printers: Array<{ ip: string; name: string }> }>;
}

const ThermalPrinter = registerPlugin<ThermalPrinterPlugin>('ThermalPrinter');

export default ThermalPrinter; 