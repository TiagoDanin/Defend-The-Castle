node scripts/get-text-items.js
(echo itemsAllText.js && echo base/tips.js && echo base/quest.js && find items/ && find plugins/) | grep .js | sort | npx nodejs-i18n --value | msgmerge --backup=off --update locales/pt.po /dev/stdin
