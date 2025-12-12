# Dans ma bulle
Comic reader dedicated to local books.

* When you may not have any network to read your comic book
* When you have a digital copy on your device

Here come Dans ma bulle! (french for "within my bubble")

![Dans ma bulle logo](https://raw.githubusercontent.com/Keiwen/dans-ma-bulle/master/src/assets/img/serene_light_logo_100.png)

This application will ask you to choose a directory on your device
that will be read (**no write action**).

>## Important compatibility note
> Dans ma bulle require, as first step, to select a directory from the user's device
>
> Regarding mobile devices, **only Chrome mobile browser** currently
> supports this requirement, and only since version 132,
> released around 2025-01-14.
> Other browsers does not plan to add this functionality soon (in 2025).
>
> Regarding PC browser, Dans ma bulle should be compatible with
> Chrome, Edge and Opera.
> The requirement is not supported by Firefox or Safari.
>
> You can refer to
> [showDirectoryPicker browser compatibility](https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker#browser_compatibility)
> for more details

## Usage
### Setup
This is a Progressive Web App (PWA). If you are not familiar with this,
it is a web application that could act as a device application on
Android.

Simply open the [application link](https://keiwen.github.io/dans-ma-bulle/), your device should offer you to
'add to home screen' or 'install'.

### In-app
Choose your main directory as library.
The application will crawl files in this directory.

You can then choose a series, a book volume, and read it!

## Library architecture
It will be required to follow a specific architecture in this directory:
a folder per series, each containing a folder per volume,
each containing a image file per page. For example:
* Comic series A name
  * Volume 1 name
    * Page 1 image
    * Page 2 image
    * ...
  * Volume 2 name
  * ...
* Comic series B name
* ...

Currently, the application supports these file extensions: jpg/jpeg.

## Mobile troubleshooting
### Library permission reset
Mobile browser currently revoke any permission granted to access your file,
for security reasons. Therefore, you'll 'lost' access to your library folder
each time you re-open the application. Whenever this is detected,
you are redirected to the setup page with a new button to restore permission.
By security reason again, you need to click on this button and it cannot be
automated.
