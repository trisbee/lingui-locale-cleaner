const path = require('path');
const fs = require('fs');


export function cli(args) {
    if (args.length !== 3) {
        console.error('[ERROR] Please specify path to your parent .po directory!')
        return;
    }


    let parentDir = path.join(args[2]);

    if (!fs.existsSync(parentDir)) {
        console.error(`[ERROR] Directory ${parentDir} doesn't exists`)
        return;
    }

    fs.readdir(parentDir, (err, files) => {
            files = files.filter(file => file !== '_build');
            files.forEach(localeDir => {

                // creates backup files
                let backUpPath = path.join(parentDir, localeDir, 'backup_messages.po');
                let localePath = path.join(parentDir, localeDir, 'messages.po');

                fs.copyFileSync(localePath, backUpPath, (err) => {
                    if (err) console.log(err);
                });

                try {
                    fs.readFile(localePath, 'utf-8', (err, data) => {
                        data = data.replace(/^#[:] [^\n]+$/gm, '');
                        data = data.replace(/[\r\n|\r|\n]+/gm, '\n');

                        //checks for first empty line
                        let counter = 0;
                        data = data.replace(/(#~ )?msgid [^\n]+$/gm, (t) => {
                            if (t !== undefined && counter !== 0) {
                                counter++;
                                return '\n' + t;
                            }
                            counter++;
                            return t;
                        });
                        fs.writeFile(localePath, data, (err) => {
                            if (err) console.error(err);
                            else {
                                console.log(`Locale ${localeDir} has been optimized!`);
                            }
                        });
                    });
                    fs.unlink(backUpPath, (err) => {
                        if (err) console.log(err);
                    });
                } catch (e) {
                    fs.copyFile(backUpPath, localePath, (err) => {
                        if (err) console.log(err);
                    });
                    fs.unlink(backUpPath, (err) => {
                        if (err) console.log(err);
                    });
                }
            });
        },
    );
}
