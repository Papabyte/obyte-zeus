# obyte-zeus

## Introduction
This is a **web-application** that can be used by people without specific knowledge to generate a special type of address for O<sub>byte</sub> called **Zeus address**. These addresses are controlled by two different types of key that has a hierarchy. The purpose is for the management of a company to be able to revoke the keys they entrusted to their team.

![Master key can revoke production key](https://raw.githubusercontent.com/Papabyte/obyte-zeus/master/public/drawing-zeus.svg?sanitize=true)

Although it is mainly intended for application that primarly posts data into O<sub>byte</sub> like Oracles or witnesses, it can also be used for application that performs financial transactions.


## Usage

#### From O<sub>byte</sub> server (less secure)

- Go to (zeus.papabyte.com)
- Follow instructions



<p align="center">
<img src="https://raw.githubusercontent.com/Papabyte/obyte-zeus/master/public/screenshot.png" height="450px" text-align="center">
</p>


#### From local server (recommended)

On Windows, MacOS or linux.

- Install Node.js and Git if you don't have them already
- `git clone https://github.com/Papabyte/obyte-zeus.git`
- `cd obyte-zeus`
- `npm install`
- `npm run serve`

If eveything went well this should appear on your console: 

>  DONE  Compiled successfully in 3446ms                                
> 05:57:42
> 
>   App running at:
>   - Local:   http://localhost:8081/ 
>   - Network: http://10.0.1.236:8081/
> 
>   Note that the development build is not optimized.   To create a
> production build, run npm run build.

Click on the link provided to open the application in your browser.


## Production key deployment

The production key is to be deployed with this module: (https://github.com/Papabyte/headless-zeus-address)
It's a replacement for headless-obyte.