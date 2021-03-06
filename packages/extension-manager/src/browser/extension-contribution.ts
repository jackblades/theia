/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable, inject } from "inversify";
import { MessageService } from "@theia/core";
import { FrontendApplication, FrontendApplicationContribution } from "@theia/core/lib/browser";
import { ExtensionManager } from '../common';
import { WidgetManager } from '@theia/core/lib/browser/widget-manager';

@injectable()
export class ExtensionContribution implements FrontendApplicationContribution {

    constructor(
        @inject(WidgetManager) protected readonly widgetManager: WidgetManager,
        @inject(ExtensionManager) protected readonly extensionManager: ExtensionManager,
        @inject(MessageService) protected readonly messageService: MessageService,
    ) {
        this.extensionManager.onWillStartInstallation(({ reverting }) => {
            if (!reverting) {
                this.messageService.info('Installing extensions...');
            } else {
                this.messageService.error('Failed to install extensions. Reverting...');
            }
        });
        this.extensionManager.onDidStopInstallation(({ reverting, failed }) => {
            if (!failed) {
                const reloadMessage = !reverting ? 'Reload to complete the installation.' : 'Reload to revert the installation.';
                this.messageService.info(reloadMessage).then(() => window.location.reload());
            }
        });
    }

    async onStart(app: FrontendApplication): Promise<void> {
        const extensionWidget = await this.widgetManager.getOrCreateWidget('extensions');
        app.shell.addToLeftArea(extensionWidget, {
            rank: 300
        });
    }

}
