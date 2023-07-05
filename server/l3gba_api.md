### Here is defined the WS API
i mainly use the first char as recon because it told to myself it's a good idea and sometimes i use the underscore as a useless
delimiter too,

| name         | string             | description                                                              | 
|--------------|--------------------|--------------------------------------------------------------------------|
| keydown      | d**X**             | **X** goes from 0 to 8 each one representing one input pressed down      |
| keyup        | u**X**             |  same but keys are pressed up                                            |
| pause on     | o                  | a client pressed a pause menu                                            |
| pause off    | f                  | a client returned to the emulator                                        |
| disconnected | q_n                | a client has disconnected n is number client                             |
| joined       | j_**XYZ**#n        | a client has joined **XYZ** is username; #-> Separtor; n-> n client      |
| list player  | l_**XYZ#ns~XYZs**  | **XYZ**->username; s -> +1bit status; n -> n client ~ # -> separators    |
| readyness    | r**X**             | **X** is boolean to tell if ready or not                                 |
| start        | s                  | all clients are ready, thus game can start, a client is fireing the go   |
| settings     | x_**X****XYZ**     | share the room settings index **X** with value **XYZ**                   |
| all settings | a_**X****XYZ**     | client ask for the room settings X the index, XYZ the value              |
| room reset   | z                  | reset for everyone the emulator                                          |
| users ping   | p_n#l~n#l          | list all user by number and their latency                                |
| client good  | g                  | client received its auth and implicitely ask an update of the room       |

| name         | server sent?| client sent?| server answers?| client answers?|server broadcast?|
|--------------|-------------|-------------|----------------|----------------|-----------------|
| keydown      | no          | yes         | no             | no             |  yes            |
| keyup        | no          | yes         | no             | no             |  yes            |
| pause on     | in future   | yes         | no             | no             |  no             |
| pause off    | in future   | yes         | no             | no             |  no             |
| disconnected | yes         | no          | no             | no             |  yes            |
| joined       | yes         | no          | no             | no             |  yes            |
| list player  | yes         | no          | yes            | no             |  no             |
| readyness    | no          | yes         | no             | no             |  yes            |
| start        | no          | yes         | yes            | no             |  yes            |
| settings     | no          | yes         | yes            | no             |  no             |
| all settings | yes         | no          | yes            | no             |  no             |
| room reset   | no          | yes         | no             | no             |  yes            |
| users ping   | yes         | no          | no             | no             |  no             |
| client good  | no          | yes         | implicitely    | no             |  no             |