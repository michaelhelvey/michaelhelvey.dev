---
layout: ../../layouts/PostLayout.astro
title: "Rust OS Development DevLog #1"
subtitle: "Learning embedded Rust development by building a tiny OS for the Raspberry PI 3b+"
date: "April 24, 2023"
---

## Preface

I want to learn embedded software development, specifically with Rust. Now, unlike other posts on
this blog, I'm not going to be writing about something I know how to do, but instead something that
I have _no idea_ how to do.

### Goal

_It's hard to write a specific goal for something that you don't really understand, but here goes._

- Target hardware: Raspberry Pi 3b+ (Broadcom BCM2837B0 chip, Cortex A-53 CPU)
- 64 bit kernel
- Boots at least on quemu's `raspi3b` machine type, although I do have a real one in the closet,
  stretch goal would be booting on real hardware
- Utilizes all 4 cores of the CPU
- Reads and writes over UART
- Can run arbitrary user space programs in ARM user mode (I think that's a thing?) with cooperative
  multi-tasking (no pre-emption or fancy scheduling).

Stretch goal: userspace TCP stack that I can use to send messages to the OS from my other machines.

_Explicit non-goals, just to be clear_:

- Anything involving USB
- File system
- Graphics

### Context

Where I'm coming from:

- I've lurked around on the osdev wiki, reading articles for the past couple of years.
- I've watched [gamozolabs](https://twitter.com/gamozolabs) build fuzzing systems on Twitch off and
  on.
- I've occassionally browsed through things like the minix source code, or read a chapter of
  Tanenbaum's "Modern Operating Systems" here or there, but I don't think I retained a lot.
- I'm a pretty competent user of systems languages and I can mostly _read_ arm64 assembly assuming I
  have the reference documentation handy.
- I have no idea about the raspberry PI in general -- all I've ever done is run linux & pihole on
  it, so I'm not familiar in general with using a PI for embedded development at all.

So to sum up, I have no idea what I'm doing. I expect there will be a good deal of floundering going
on this this devlog.

As a result, my plan here is to (rather than post articles), simply to append to this post here,
perhaps splitting it occassionally when I get to good stopping points so it doesn't get too long,
just to summarize how each day of development goes.

### Code

I'm currently keeping all the code for the project
[here](https://github.com/michaelhelvey/barnacle). Why is it called "barnacle"? Because I have no
idea what to name this and that's what Github suggested when I created the repository. Maybe I'll
think of a good name as I go along and re-christen it.

## Day 1 (4/24/23): Blog Post + Development Environment Setup

- First off, I wrote this blog post that you're reading.

I think step 1 here is getting my local development environment set up, and just figuring out in
general how the machine I'm writing this for works. I know that the PI ships with an open source
Linux based OS and bootloader, so figuring how all that works and booting it in qemu is probably a
good start. At least that way I know the code works so I can use that to figure out my environment.
Plus if I'm going to write a bootloader and a kernel I need to at least understand the boot process
of the machine I'm writing them for I think.

So...I'm trying to boot an OS on qemu, but I don't know anything about the OS other than that it's
Linux based. Maybe I can gin up some muscle memory from setting up Arch or something. I guess I'll
start with the
[offical docs](https://www.raspberrypi.com/documentation/computers/os.html#introduction).

Ah, there's a section called "the boot folder" that specifies a bunch of stuff that needs to be in
the root of the boot partition when the OS boots.

A few things stand out:

> Raspberry Pi uses a configuration file instead of the BIOS you would expect to find on a
> conventional PC. The system configuration parameters, which would traditionally be edited and
> stored using a BIOS, are stored instead in an optional text file named config.txt

`start.elf`. This bootloader loads ELF files? Wild. What does this bootloader even do? I guess I'm
not dealing with a standard like UEFI here per se. I'm going to need to find some documentation for
what kind of environment this bootloader launches my code into. Am I going to be in 32 or 64 bit
mode when I start? Where does it put tables I can query to do things like initialize the UART? I'm
not seeing a wealth of documentation on this bootloader in this document. Apparently this bootloader
is actually shipped with the EEPROM in the 4+ models.

Oooh, it supports network boot over PXE, and apparently _that_ loads bootcode.bin. That could be
really useful later on for speeding up our dev cycle on real hardware. I think that tells me that I
need to figure out what the boot ROM on this system does before I learn what this bootloader does.
What if I want to write my own bootloader?

- Ah, praise stack overflow, somebody
  [wrote about all this](https://raspberrypi.stackexchange.com/questions/10489/how-does-raspberry-pi-boot/10490#10490).
- Apparently there is also a [repo of bare metal examples](https://github.com/dwelch67/raspberrypi)
  with some custom bootloader stuff in there, that might come in handy later.
- Ah, and we have an [official firmware repository](https://github.com/raspberrypi/firmware)
  although these just seem to have compiled binaries and DTBs and stuff in them, a bit light on the
  docs here.

Anyway, I'm getting distracted, I said I was going to boot Linux today, not write a bootloader.
Let's just build a boot directory like they told me too.

A little `curl`ing and I have what claims to be a 64 bit kernel image of the kernel compatible with
the 3b. I'll throw that in a directory along with the other files that they specify in "boot folder"
and see what happens I suppose.

Looks like I need:

- A kernel (got that)
- A bootcode.bin which apparently is loaded by the SoC on boot and then loads one of the ELF files
- A start.elf file which apparently takes over the boot process next and loads more firmware.
- A fixup.dat file for linking the elf files, fair enough.
- A device tree blob for configuring the kernel based on the model. I'll grab the one for the 3b
  since I think that's what quemu is going to be emulating.
- A config.txt file? I don't know what I want for any of these options to be honest. I still feel
  like these docs could use a "how to boot the OS" section...maybe there is one and I'm just not
  finding it. Obviously I can just install a raspbian image and boot that but I'm not going to learn
  how to boot a kernel on this machine by doing that.

Ok, so I have a directory which a bunch of stuff in it, now somehow as far as I know have to turn
that into a boot partition on a qemu VM, and also figure out what qemu settings I need to hook up
graphics and networking and whatever else I need to test this out, but that will have to wait for
day 2, because it's time to go wake my child up and give her breakfast and what not.
