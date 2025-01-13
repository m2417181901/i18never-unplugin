import type { UnpluginFactory, } from "unplugin";
import { createUnplugin } from "unplugin";
import {
    initOptions,
    PluginOptions,
    queryVersion,
    generateScript,
    supportExts,
} from '@i18never/shared';
import { createFilter } from '@rollup/pluginutils';
import { KeyItem, transform } from '@i18never/transform';
import { extname } from 'path';
export interface Options {
    include: any,
    exclude
}
import path from 'path';
import fs from 'fs';
const concat = Array.prototype.concat;

function getExtname(id: string) {
    let ext = extname(id);

    const index = id.indexOf('?');
    if (index > -1) {
        const realExt = extname(id.substring(0, index));
        // if (realExt !== '.vue') {
            ext = realExt;
        // }
    }

    return ext;
}
export const unpluginFactory: UnpluginFactory<PluginOptions> = (options = {}) => {

    initOptions(options)

    const idKeysMap: Record<string, KeyItem[]> = {};
    const filter = createFilter(options.include || 'src/**', options.exclude || 'node_modules/**');
    
    return {
        name: 'i18never-unplugin',

        transformInclude(id) {
            // console.log(id);
            if (
                !filter(id) ||
                !(supportExts as ReadonlyArray<string>).includes(
                    getExtname(id)
                )
            ) {
                return false;
            }
            return true;
        },

        transform(code, id) {
            const { code: output, keys } = transform(code);
            if (keys.length) {
                idKeysMap[id] = keys;
            }
            return output;
        },

        async buildEnd(this: any) {
            const htmlFileName = 'index.html';
            const { compilation } = (this.getNativeBuildContext() as any);    
            const version = await queryVersion(
                concat.apply([], Object.values(idKeysMap))
            );
            if (compilation.assets[htmlFileName]) {
                const htmlAsset = compilation.assets[htmlFileName];
                let htmlContent = htmlAsset.source();
                htmlContent = htmlContent.replace(
                    '<head>',
                    `<head>\n\t\t<script>${generateScript(version, options)}</script>`
                );
                compilation.assets[htmlFileName] = {
                    source: () => htmlContent,
                    size: () => htmlContent.length,
                };
            }
        },
    }
}

export const unplugin = createUnplugin(unpluginFactory);

export default unplugin;

export const rspackPlugin = unplugin.rspack;