### FORKED FROM
https://github.com/44670/44vba
which is a fork of https://github.com/libretro/vba-next
## What is it about
I wanted to play with a friend over the internet like we play on the same gameboy console.
While looking for solution to this problem, some people told me with a smug that i could just share inputs 
and since an emulator is deterministic it should perfectly sync the game right?

Ofc i was annoyed to theses answers, like not it's not deterministic if you have a floating time between both inputs bigger than the internal clock,
 just simply the RNG will be different and not what i wanted.
Then it struck me! Hold on what if the desync is the fun i was looking for.

Hear me out, imagine pokemon with a quite synced game but one client has a crit, the pokemon faint, but on the other client it doesn't faint.
so we have both client desynced now. How is it fun? try to beat both sligtly different fights with all input desynced, try to explain to your mate
that pressing A now would cause a bad thing while they are telling you that pressing B is even worse for them.
I hope you get the idea, it's a difficult cooperation game.

Hence the name **L3GBA** which is the final contraction of 3 legged GBA, a reference to an ye old game called "three legged race", you may google it if you had no childhood.

## How to
in case you're curious how that works, i haven't hosted any version anywhere so far for you to test it.
it's just a nodejs project so git clone it, build it with ```npm init``` then ```npm run start``` to get it running.
it runs on the port 9090 for the http and 9091 for the websockets but ofc it's just arbitrary. and about the hostname, 127.0.0.1 won't work if you're about to share it to others.

concerning the emulator/wasm part made by 44670, i've builded it myself then feed this project with the builded files and i don't plan in the near future to involve myself into it.

## Contributing
feel free.

## TODO LIST
- [ ] a clean front end
- [ ] an icon
- [ ] do a thing about the DOS potential of the server and others ill-intended things
    - [ ] rate limit the room creations
- [ ] beta-testing to find bugs
- [ ] maybe a more professionnal back end (logging, containers)
- [ ] implement the input sync for the touchpad (not keyboards things)
- [ ] i've removed some features like cheats that were bugging me, i need to reintroduce them
- [ ] an https mode would be great.