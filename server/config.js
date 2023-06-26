import fs from 'fs'
import chalk from 'chalk';
import log from 'loglevel';
import prefix from 'loglevel-plugin-prefix'

/* CONFIG FILE
{
    "hostname":     "127.0.0.1",
    "http_port":    9093,
    "ws_port":      9094,
    "loglevel":      "" //trace, debug, info, warn, error, silent
}
*/

var defaultConf = "./config/default.json"
/*  
    retrieve the config from the config file
    @conf: config file path (relative)
    @return: js object
*/
export function retrieve(conf){
    try{
        let data = fs.readFileSync(conf, 'utf8')
        return JSON.parse(data)
    }
    catch(e){
        console.error(e)
        console.log("trying default config file: "+defaultConf)
        try{
            let data = fs.readFileSync(defaultConf, 'utf8')
            return JSON.parse(data)
        }
        catch(e){
            console.error(e)
            console.warn("couldn't find a configuration file, ending the process")
            process.exit(1)
        }
    }
}

/*
    configure the logger to be pretty pretty (and more informing)
    
    returns the logger
*/
export function configureLogger(){
    var logger = log
    var colors = {
        TRACE: chalk.magenta,
        DEBUG: chalk.cyan,
        INFO: chalk.blue,
        WARN: chalk.yellow,
        ERROR: chalk.red,
    };
    prefix.reg(log);
    prefix.apply(log, {
        format(level, name, timestamp) {
            return `${chalk.gray(`[${timestamp}]`)} ${colors[level.toUpperCase()](level)} ${chalk.green(`${name}:`)}`;
        },
    });

    prefix.apply(log.getLogger('critical'), {
        format(level, name, timestamp) {
          return chalk.red.bold(`[${timestamp}] ${level} ${name}:`);
        },
    });
    log.getLogger("critical").setLevel("TRACE");

    return logger
}

/*
    verify if one of the field of the config file is missing
    log the errors
    if flag is set to true minor errors are corrected

    returns false if a critical error has been detected
*/
export function verify(cfg,logger,flag){
    if(!cfg || !logger){
        return false
    }
    var isNonCritical = true
    if(!cfg.hostname){
        logger.error("config.verify:    missing hostname")
        if(flag){
            logger.warn("setting hostname to localhost")
            cfg.hostname="127.0.0.1"
        }else{
            isNonCritical=false
        }
    }
    if(!cfg.http_port){
        logger.error("config.verify:    missing http_port")
        if(flag){
            logger.warn("setting http_port to 9093")
            cfg.http_port=9093
        }else{
            isNonCritical=false
        }
    }
    if(!cfg.ws_port){
        logger.error("config.verify:    missing ws_port")
        if(flag){
            logger.warn("setting ws_port to 9094")
            cfg.ws_port=9094
        }else{
            isNonCritical=false
        }
    }
    if(!cfg.loglevel){
        logger.warn("config.verify:     missing loglevel")
        logger.warn("setting loglevel to warn")
        cfg.loglevel="warn"
    }
    if(!cfg.http_loglevel){
        logger.warn("config.verify:     missing http_loglevel")
        logger.warn("setting http_loglevel to warn")
        cfg.http_loglevel="warn"
    }
    if(!cfg.ws_loglevel){
        logger.warn("config.verify:     missing ws_loglevel")
        logger.warn("setting ws_loglevel to warn")
        cfg.ws_loglevel="warn"
    }
    if(!cfg.rooms_loglevel){
        logger.warn("config.verify:     missing rooms_loglevel")
        logger.warn("setting rooms_loglevel to warn")
        cfg.rooms_loglevel="warn"
    }
    return isNonCritical
}