import applyMixins from "mixins-may-apply"

abstract class CanGreet {
    // @ts-ignore
    public name: string;

    public greet() {
        return `Hello, I'm ${this.name}!`
    }
}

abstract class HasSuperpower {
    // @ts-ignore
    public superpower: string;

    public announceSuperpower() {
        return `I have the ability to ${this.superpower}.`
    }
}

interface SuperHero extends CanGreet, HasSuperpower { }

class SuperHero {
    public constructor(name: string, superpower: string) {
        this.name = name;
        this.superpower = superpower;
    }
}

applyMixins(SuperHero, [CanGreet, HasSuperpower]);

const frozone = new SuperHero("Frozone", "generate ice");
frozone.greet(); //=> 'Hello, I\'m Frozone!'
frozone.announceSuperpower(); //=> 'I have the ability to generate ice.