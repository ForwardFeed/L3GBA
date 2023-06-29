### Here is defined the WS API
i mainly use the first char as recon because it told to myself it's a good idea and sometimes i use the underscore as a useless
delimiter too,

| name         | string             | description                                                              | 
|--------------|--------------------|--------------------------------------------------------------------------|
| keydown      | d**X**             | **X** goes from 0 to 8 each one representing one input pressed down      |
| keyup        | u**X**             |  same but keys are pressed up                                            |
| pause on     | o                  | a client pressed a pause menu                                            |
| pause off    | f                  | a client returned to the emulator                                        |
| disconnected | q_**XYZ**          | a client has disconnected **XYZ** is username                            |
| joined       | j_**XYZ**          | a client has joined **XYZ** is username                                  |
| list player  | l_**XYZ#s~XYZs**   | list player **XYZ**->username; s -> +1bit status; ~ -> separator         |
| readyness    | r**X**             | **X** is boolean to tell if ready or not                                 |
| start        | s                  | all clients are ready, thus game can start, a client is fireing the go   |
| settings     | x_**X****XYZ**     | share the room settings index **X** with value **XYZ**                   |
| all settings | a_**X****XYZ**#s   | client ask for the room settings                                         |
| room status  | z                  | reset for everyone the emulator                                          |

| name         | server sent?| client sent?|
|--------------|-------------|-------------|
| keydown      | yes         | yes         |
| keyup        | yes         | yes         |
| pause on     | yes         | yes         |
| pause off    | yes         | yes         |
| disconnected | yes         | no          |
| joined       | yes         | no          |
| list player  | yes         | no          |
| readyness    | yes         | yes         |
| start        | yes         | yes         |
| settings     | yes         | yes         |
| all settings | yes         | yes         |
| room status  | yes         | yes         |