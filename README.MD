### FORKED FROM
https://github.com/44670/44vba
which is a fork of https://github.com/libretro/vba-next
## What is it about
I wanted to play with a friend over the internet like we play on the same gameboy console.
While looking for solution to this problem, some people told me with a smug that i could just share inputs 
and since an emulator is deterministic it should perfectly sync the game right?

Ofc i was annoyed to theses answers, it's deterministic if you have a floating time between both synced inputs bigger than the internal clock. If a single clock tick is different, the RNG will be different and 99% of games relies on RNG.
Then it struck me! Hold on! What if the desync is the fun i was looking for.

Hear me out, imagine pokemon with a quite synced game but one client has a crit, the pokemon faint, but on the other client it doesn't faint.
so we have both client desynced now. How is it fun? try to beat both sligtly different fights with all input desynced, try to explain to your mate
that pressing A now would cause a bad thing while they are telling you that pressing B is even worse for them.
I hope you get the idea, it became a difficult cooperation game. Also even without any Dsync, chilling with a friend in voice chat while criticising the choice of the other(s).

Hence the name **L3GBA** which is the final contraction of 3 legged GBA, is a reference to an ye old game called "three legged race", you may google it if you had no childhood.

## How to
in case you're curious how that works, i haven't hosted any version anywhere so far for you to test it.
it's just a nodejs project so git clone it, build it with ```npm init``` then ```npm run start``` to get it running.
it runs on the port 9090 for the http and 9091 for the websockets but ofc it's just arbitrary. and about the hostname, 127.0.0.1 won't work if you're about to share it to others.

concerning the emulator/wasm part made by 44670, i've builded it myself then feed this project with the builded files but i don't plan in the near future to involve myself more into it.

## Contributing
feel free.

## TODO LIST
- [ ] improvement front end
    - [x] index.html
    - [ ] room.html
- [ ] an icon
- [ ] Security
    - [ ] rate limit the room creations
- [ ] a more professionnal back end (logging, containers)?
- [ ] heartbeat to disconnect any freezing client?
- [ ] server side config file
- [ ] implement the input sync for the touchpad & gamepad
    - [ ] test gamepad
    - [x] test touchpad
- [ ] feature reintroduction
    - [x] Cheats (untested)
    - [ ] turbo mode
- [ ] an https mode?
- [ ] answer and implement about "what to do if someone just joined in the middle of a game"
- [ ] room settings
    - [ ] pause on disconnect/reconnect
    - [ ] lag input for sync improvement
- [ ] room features
    - [ ] a force resync where one player share its gamestate (384 kb i believe)
    - [ ] sharing savefiles (max: 512kb )
    - [ ] prevent the player to missclick into leaving the room
- [ ] add warning for unsupported harware on the main page.
    - [x] wasm
- [ ] replace all deprecated function
    - [ ] audio -> AudioWorklet (requires https)
    - [ ] window.onorientationchange -> ScreenOrientation
    - [x] navigator.plateform won't be changed due to its replacement being "meh"
- [ ] notify if clients aren't using the same file