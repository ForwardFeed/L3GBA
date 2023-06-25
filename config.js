import fs from 'fs'

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