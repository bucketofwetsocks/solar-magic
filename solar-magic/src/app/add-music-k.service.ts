import { Injectable } from '@angular/core';
import { FileService } from './file.service';
import { WorkspaceService } from './workspace.service';

const execSync = (<any>window).require('child_process').execSync;
const path = (<any>window).require('path');
const fs = (<any>window).require('fs');
const eol = (<any>window).require('os').EOL;

/**
 * service provides an interface to work with AddMusicK.
 */
@Injectable({
  providedIn: 'root'
})
export class AddMusicKService {
  constructor(
    private workspaceService: WorkspaceService,
    private fileService: FileService
  ) {

  }

  /**
   * Gets the original music list from Vanilla SMW.
   * This serves as a guide to help hackers who want to edit
   * original music, or to replace the vanilla pointers.
   */
  public getOriginalsList(): string[] {
    return [
      `originals/01 Miss.txt`,
      `originals/02 Game Over.txt`,
      `originals/03 Boss Clear.txt`,
      `originals/04 Stage Clear.txt`,
      `originals/05 Starman.txt`,
      `originals/06 P-switch.txt`,
      `originals/07 Keyhole.txt`,
      `originals/08 Iris Out.txt`,
      `originals/09 Bonus End.txt`,
      `originals/10 Piano.txt`,
      `originals/11 Here We Go.txt`,
      `originals/12 Water.txt`,
      `originals/13 Bowser.txt`,
      `originals/14 Boss.txt`,
      `originals/15 Cave.txt`,
      `originals/16 Ghost.txt`,
      `originals/17 Castle.txt`,
      `originals/18 Switch Palace.txt`,
      `originals/19 Welcome.txt`,
      `originals/20 Rescue Egg.txt`,
      `originals/21 Title.txt`,
      `originals/22 Valley of Bowser Appears.txt`,
      `originals/23 Overworld.txt`,
      `originals/24 Yoshi's Island.txt`,
      `originals/25 Vanilla Dome.txt`,
      `originals/26 Star Road.txt`,
      `originals/27 Forest of Illusion.txt`,
      `originals/28 Valley of Bowser.txt`,
      `originals/29 Special World.txt`,
      `originals/30 IntroScreen.txt`,
      `originals/31 Bowser Scene 2.txt`,
      `originals/32 Bowser Scene 3.txt`,
      `originals/33 Bowser Defeated.txt`,
      `originals/34 Bowser Interlude.txt`,
      `originals/35 Bowser Zoom In.txt`,
      `originals/36 Bowser Zoom Out.txt`,
      `originals/37 Princess Peach is Rescued.txt`,
      `originals/38 Staff Roll.txt`,
      `originals/39 The Yoshis Are Home.txt`,
      `originals/40 Cast List.txt`,
    ];
  }

  /**
   * reads the list file and returns the list of music in thar.
   */
  public getMusicList(): string[] {
    const listfile = path.join(this.workspaceService.getMusicFolder(), 'Addmusic_list.txt');
    const contents = fs.readFileSync(listfile).toString();
    console.dir(contents);
    const lines:string[] = contents.split(eol);
    // filter the lines to get rid of the labels and empty lines.
    const filtered = lines.filter((l) => /[0-9|a-f|A-F]{2}\s{2}.*/.test(l))
    // remove the index number, as these can be generated later.
    // example: "0A  musicname.txt" -> "musicname.txt"
    const cleaned = filtered.map((l) => {
      const split = l.split(' ').filter((i) => i.length > 0);
      split.shift();
      return split.join(' ');
    });
    return cleaned;
  }

  public getWorkspaceList(): string[] {
    const musicFolder = path.join(this.workspaceService.getMusicFolder(), 'music');
    const textFiles = this.fileService.getOnlyFiles(musicFolder).filter((f) => f.endsWith('.txt'));
    const fileNames = textFiles.map((f) => path.basename(f));
    return fileNames;
  }

  public saveMusicList(music: string[]) {

  }


}
