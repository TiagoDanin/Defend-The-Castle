find plugins/ | grep .js | sort | npx nodejs-i18n | msgmerge --backup=off --update locales/pt.po /dev/stdin
