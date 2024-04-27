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

## Day 1 (4/24/24): Blog Post + Development Environment Setup

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

`start.elf`. This bootloader loads ELF files? Wild. I'm going to need to find some documentation for
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

## Day 2 (4/26/24): Day 2 of Figuring how to boot linux

When I left off last time, I had some files, and I needed to try and turn them into a bootable
image.

I had a better idea since last time than just tryand figure out from scratch what's going on here,
why don't I download one of the images from their download page and see what's in there?

I'm not very familiar with the macos commands for all this, so I think what I'll do is spin a docker
container with linux in it, and mount my local directory into it, so I can use familiar linux
commands.

```shell
docker run --cap-add SYS_ADMIN --privileged --name osdev -v ./:/var/project -d --rm -it ubuntu:latest /bin/bash
```

Now I can `docker exec` into that and have linux commands, like `fdisk` that work in the expected
way.

I grabbed a "Raspberry PI OS Lite" image from the official downloads page, and now I can inspect it:

```shell
root@0af89a5fdacb:/var/project# unxz ./2024-03-15-raspios-bookworm-armhf-lite.img.xz
root@0af89a5fdacb:/var/project# fdisk -l ./2024-03-15-raspios-bookworm-armhf-lite.img
Disk ./2024-03-15-raspios-bookworm-armhf-lite.img: 2.37 GiB, 2541748224 bytes, 4964352 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x662b4900

Device                                        Boot   Start     End Sectors  Size Id Type
./2024-03-15-raspios-bookworm-armhf-lite.img1         8192 1056767 1048576  512M  c W95 FAT32 (LBA)
./2024-03-15-raspios-bookworm-armhf-lite.img2      1056768 4964351 3907584  1.9G 83 Linux
```

Ok, so we have a boot partition and a a linux partition, that makes sense. Let's see what's in the
boot partition first, since that's what we're trying to build here.

```shell
root@0af89a5fdacb:/var/project# mount -v -o offset=4194304 ./2024-03-15-raspios-bookworm-armhf-lite.img /mnt/rasp
mount: /dev/loop1 mounted on /mnt/rasp.

root@0af89a5fdacb:/var/project# ls -lah /mnt/rasp
total 93M
drwxr-xr-x 3 root root 6.0K Jan  1  1970 .
drwxr-xr-x 1 root root 4.0K Apr 26 11:07 ..
-rwxr-xr-x 1 root root 1.6K Mar 15 14:59 LICENCE.broadcom
-rwxr-xr-x 1 root root  29K Mar  7 14:51 bcm2708-rpi-b-plus.dtb
-rwxr-xr-x 1 root root  29K Mar  7 14:51 bcm2708-rpi-b-rev1.dtb
-rwxr-xr-x 1 root root  29K Mar  7 14:51 bcm2708-rpi-b.dtb
-rwxr-xr-x 1 root root  29K Mar  7 14:51 bcm2708-rpi-cm.dtb
-rwxr-xr-x 1 root root  31K Mar  7 14:51 bcm2708-rpi-zero-w.dtb
-rwxr-xr-x 1 root root  29K Mar  7 14:51 bcm2708-rpi-zero.dtb
-rwxr-xr-x 1 root root  31K Mar  7 14:51 bcm2709-rpi-2-b.dtb
-rwxr-xr-x 1 root root  31K Mar  7 14:51 bcm2709-rpi-cm2.dtb
-rwxr-xr-x 1 root root  31K Mar  7 14:51 bcm2710-rpi-2-b.dtb
-rwxr-xr-x 1 root root  34K Mar  7 14:51 bcm2710-rpi-3-b-plus.dtb
-rwxr-xr-x 1 root root  33K Mar  7 14:51 bcm2710-rpi-3-b.dtb
-rwxr-xr-x 1 root root  31K Mar  7 14:51 bcm2710-rpi-cm3.dtb
-rwxr-xr-x 1 root root  32K Mar  7 14:51 bcm2710-rpi-zero-2-w.dtb
-rwxr-xr-x 1 root root  32K Mar  7 14:51 bcm2710-rpi-zero-2.dtb
-rwxr-xr-x 1 root root  54K Mar  7 14:51 bcm2711-rpi-4-b.dtb
-rwxr-xr-x 1 root root  54K Mar  7 14:51 bcm2711-rpi-400.dtb
-rwxr-xr-x 1 root root  38K Mar  7 14:51 bcm2711-rpi-cm4-io.dtb
-rwxr-xr-x 1 root root  55K Mar  7 14:51 bcm2711-rpi-cm4.dtb
-rwxr-xr-x 1 root root  52K Mar  7 14:51 bcm2711-rpi-cm4s.dtb
-rwxr-xr-x 1 root root  76K Mar  7 14:51 bcm2712-rpi-5-b.dtb
-rwxr-xr-x 1 root root  76K Mar  7 14:51 bcm2712-rpi-cm5-cm4io.dtb
-rwxr-xr-x 1 root root  76K Mar  7 14:51 bcm2712-rpi-cm5-cm5io.dtb
-rwxr-xr-x 1 root root  76K Mar  7 14:51 bcm2712d0-rpi-5-b.dtb
-rwxr-xr-x 1 root root  52K Mar 15 14:59 bootcode.bin
-rwxr-xr-x 1 root root  154 Mar 15 15:06 cmdline.txt
-rwxr-xr-x 1 root root 1.2K Mar 15 14:59 config.txt
-rwxr-xr-x 1 root root 7.2K Mar 15 14:59 fixup.dat
-rwxr-xr-x 1 root root 5.4K Mar 15 14:59 fixup4.dat
-rwxr-xr-x 1 root root 3.2K Mar 15 14:59 fixup4cd.dat
-rwxr-xr-x 1 root root 8.3K Mar 15 14:59 fixup4db.dat
-rwxr-xr-x 1 root root 8.3K Mar 15 14:59 fixup4x.dat
-rwxr-xr-x 1 root root 3.2K Mar 15 14:59 fixup_cd.dat
-rwxr-xr-x 1 root root  11K Mar 15 14:59 fixup_db.dat
-rwxr-xr-x 1 root root  11K Mar 15 14:59 fixup_x.dat
-rwxr-xr-x 1 root root  10M Mar 15 15:07 initramfs
-rwxr-xr-x 1 root root  11M Mar 15 15:07 initramfs7
-rwxr-xr-x 1 root root  11M Mar 15 15:07 initramfs7l
-rwxr-xr-x 1 root root  11M Mar 15 15:07 initramfs8
-rwxr-xr-x 1 root root  145 Mar 15 15:07 issue.txt
-rwxr-xr-x 1 root root 6.8M Mar 15 14:59 kernel.img
-rwxr-xr-x 1 root root 7.1M Mar 15 14:59 kernel7.img
-rwxr-xr-x 1 root root 7.5M Mar 15 14:59 kernel7l.img
-rwxr-xr-x 1 root root 8.9M Mar 15 14:59 kernel8.img
drwxr-xr-x 2 root root  28K Mar 15 14:59 overlays
-rwxr-xr-x 1 root root 2.9M Mar 15 14:59 start.elf
-rwxr-xr-x 1 root root 2.2M Mar 15 14:59 start4.elf
-rwxr-xr-x 1 root root 790K Mar 15 14:59 start4cd.elf
-rwxr-xr-x 1 root root 3.6M Mar 15 14:59 start4db.elf
-rwxr-xr-x 1 root root 2.9M Mar 15 14:59 start4x.elf
-rwxr-xr-x 1 root root 790K Mar 15 14:59 start_cd.elf
-rwxr-xr-x 1 root root 4.7M Mar 15 14:59 start_db.elf
-rwxr-xr-x 1 root root 3.6M Mar 15 14:59 start_x.elf
root@0af89a5fdacb:/var/project#
```

Ok, so we have one file for every imaginable machine could theoretically boot using this, but that
tells us quite a bit, honestly. For one thing, `config.txt` is empty, so apparently that's fine. I
think the next thing to do is try and create a bootable disk partition of my directory and start it
with qemu. Without a OS partition with all the required linux stuff, I'm guessing that the kernel
won't really _do_ anything when we start it, but hey, we can verify that we've made some progress
towards understanding how a PI boots.

Definitely going to be doing some googling here like I do every time I have to use the `dd` command
to build boot partitions, which is about every 3 years.

```shell
root@0af89a5fdacb:/var/project# dd if=/dev/null of=boot.img bs=1M seek=2048
0+0 records in
0+0 records out
0 bytes copied, 0.000158542 s, 0.0 kB/s
root@0af89a5fdacb:/var/project# mkfs.fat ./boot.img
mkfs.fat 4.2 (2021-01-31)
root@0af89a5fdacb:/var/project# file ./boot.img
./boot.img: DOS/MBR boot sector, code offset 0x58+2, OEM-ID "mkfs.fat", sectors/cluster 8, Media descriptor 0xf8, sectors/track 63, heads 128, sectors 4194288 (volumes > 32 MB), FAT (32 bit), sectors/FAT 4088, serial number 0xf82a111e, unlabeled
root@0af89a5fdacb:/var/project# mkdir /mnt/prep/
root@0af89a5fdacb:/var/project# mount -o loop boot.img /mnt/prep/
```

After some copying and an `unmount`, I now in theory should have a FAT32 formatted boot sector for
use with qemu.

Back on my main machine, and some more googling to find the relevant qemu arguments, here goes
nothing:

```shell
❮ qemu-system-aarch64 -machine raspi3b -cpu cortex-a53 -nographic -dtb bcm2710-rpi-3-b.dtb -m 1G -smp 4 -kernel kernel8.img -sd boot.img -append "rw earlyprintk loglevel=8 console=ttyS0 dwc_otg.lpm_enable=0 root=/dev/mmcblk0p2 rootdelay=1" -device usb-net,netdev=net0 -netdev user,id=net0,hostfwd=tcp::2222-:22
WARNING: Image format was not specified for 'boot.img' and probing guessed raw.
         Automatically detecting the format is dangerous for raw images, write operations on block 0 will be restricted.
         Specify the 'raw' format explicitly to remove the restrictions.
usbnet: failed control transaction: request 0x8006 value 0x600 index 0x0 length 0xa
usbnet: failed control transaction: request 0x8006 value 0x600 index 0x0 length 0xa
usbnet: failed control transaction: request 0x8006 value 0x600 index 0x0 length 0xa
```

Hmm, well, hey, it executed code. Doesn't seem like the kernel booted though. If I remove the usb
device from qemu, it writes nothing at all...maybe a bad DTB file? I'm also don't have any overlays
in my boot image either, so that seems problematic, since apparently it's the job of the `start.elf`
code to combine one of these files with the appropriate base device tree. I'll just dive back into
my docker container and copy some more overlays and dtb files into my boot image in the hope that I
get some ones that work on this qemu device.

Well, that didn't work either. Even booting the official image with no modifications produced the
same result. Clearly I'm doing something wrong, and I need to stop googling and try to understand
what I'm doing a little better. There's a lot of garbage in those kernel parameters, and I suspect
that I'm not getting kernel output on the right tty, perhaps?

Overall not as much progress I would have liked today, but at least I'm creating and _trying_ to
boot some stuff on qemu.

## Day 3 (4/26/24): Learning QEMU Properly

The main thing that I learned from the first couple of days is that I need to stop fighting with my
development environment and copy/pasting randoming magic commands from the internet and properly
learn my tools, starting with qemu.

So today, I'm going to sit down with the
[system emulation section](https://www.qemu.org/docs/master/system/index.html) of the qemu docs, and
read until I understand how to use qemu at a decent level. For example, I want to know how to write
some code in qemu and step through it in a debugger. Ultimately, I want to feel comfortable booting
a small Linux system from scratch through qemu, emulating fairly traditional hardware.

The following simply represents some reading notes based on reading through the documentation. I
won't attempt to summarize the documentation itself or re-explain it.

- There are many
  [example command lines](https://www.qemu.org/docs/master/system/targets.html#system-targets-ref)
  in the "System Emulator Targets" section of the manual. This a goldmine of resources about to
  emulate various different kinds of boards and system configurations, including the raspberry pi.

- The general form of a qemu command to start a machine is as follows:

```shell
$ qemu-system-x86_64 [machine opts] \
                [cpu opts] \
                [accelerator opts] \
                [device opts] \
                [backend opts] \
                [interface opts] \
                [boot opts]
```

Having read through the entirety of the "introduction" to qemu, I already feel like I know more not
only about qemu itself, but how computers boot in general. I have the Linux kernel documentation
pulled up on the side so I can look up how various things correspond to the Linux boot process, and
it's incredibly helpful. I can't believe I tried to boot Raspberry Pi OS for 2 days without just
doing this to begin with.

Having read a fair bit of documentation, the next thing I'm going to do to test out my knowledge is
attempt to run some bare metal code. Can I execute some instructions on a chip using qmeu, and debug
it? I want to avoid any of the config.txt, bootcode.bin, or any of the other "magic" as much as
possible...I'm more than happy to use those things once I understand them but I don't really feel
like I understand them yet.

First things first, I need to know where to put my instructions on the machine. Presumbably this CPU
is going to start executing instructions at some address once it powers on. I need to figure out how
to put some stuff there that I want to execute. I downloaded the official ARM architecture
reference, but that was 14k pages long, and so it's not very useful for a beginner like me who
doesn't really know what to look up to begin with.

Thankfully there was a "baremetal raspberry PI"
[guide written by dwelch67 on github](https://github.com/dwelch67/raspberrypi/blob/master/baremetal/README)
that told me everything I needed to know about the PI boot process for my use-cases. Apparently the
broad strokes, as they are relevant to my current project, is the following:

- When the device powers on, it starts the GPU, with the ARM Core _off_, and the SDRAM disabled.
- The GPU then runs some code on the SoC ROM that reads some files off of the SD card.
- Then it (the GPU) executes bootcode.bin, start.elf, etc, which enables SDRAM and loads the
  `kernel.img` file (whatever user code you give it) into memory at 0x8000. This seems to be more or
  less a magic number that was chosen because it's the Linux default, and the PI is more or less
  built to run Linux. The GPU seems to use the memory below that address to store things like
  `cmdline.txt` and other configuration.
- Anyway, so if I put some code at 0x8000 and run the machine, it should work, right?

Turns out, yes! I wrote the smallest program possible just to test out this theory.

```asm
# Bare metal hello world "kernel" (e.g. bootloader) that GPU ROM
# loads into memory at 0x8000 (linux default) and executes during
# PI boot process
.align 4
.text
.globl _start

_start:
    mov x0, #42            // load 42 into register x0
    nop                    // do nothing so I can inspect x0
```

Then I goofed around trying to build this with MacOS tools until I just gave up and installed
`aarch64-elf-binutils` via `homebrew` so I could do things using the more standard GNU toolchain.

With that I could write a `makefile` to build my little program into a valid `kernel.img`. First I
needed the linker to position the instructions at the right address (as far as I know, this wouldn't
matter for this particular program because I'm not doing anything, but as soon as I wrote any
position dependent code it would, so I might as well just start out correct):

Here's the linker script:

```
ENTRY(_start)

SECTIONS {
    . = 0x8000;
    .text : {
        *(.text)
    }
}
```

And the makefile:

```makefile
all: kernel.img

clean:
	rm -f *.o
	rm -f *.img
	rm -f *.macho

kernel.img: linker.ld main.o
	aarch64-elf-ld -T linker.ld -o main.macho main.o
	aarch64-elf-objcopy main.macho -O binary kernel.img

main.o: main.s
	aarch64-elf-as -D -o main.o main.s
```

With that, I can run qemu, specifying my custom kernel, and set it up to expose a debugger on port
1234, and to pause execution until I connect to the debugger:

```shell
qemu-system-aarch64 -machine raspi3b -cpu cortex-a53 -nographic -kernel kernel.img -s -S
```

Then I could connect via `lldb`, run `gdb-remote localhost:1234` to connect to qemu, and step
through the first few initial instructions that jump to 0x8000 just like I was told would happen,
and then I saw this beautiful sight:

```
(lldb) n
Process 1 stopped
* thread #1, stop reason = instruction step over
    frame #0: 0x0000000000080000
->  0x80000: mov    x0, #0x2a                 ; =42
    0x80004: nop
    0x80008: udf    #0x0
    0x8000c: udf    #0x0
```

42, being moved into x0, just like I had written. This is a long way from a functional computer
program that does anything useful at all, but I'm compiling instructions and running them on an
emulated raspberry PI, and stepping through it with a debugger. I have a tremendous amount to learn
but I feel like I've made my first real step towards writing an OS on this thing. If I can run
assembly, surely Rust isn't far off ;)
