let spawnerID: number[] = Array.from({ length: 53 }, (_, i) => i + 1);
let Vehicle_Abrams:        mod.VehicleList = mod.VehicleList.Abrams;
let Vehicle_AH64:          mod.VehicleList = mod.VehicleList.AH64;
let Vehicle_Cheetah:       mod.VehicleList = mod.VehicleList.Cheetah;
let Vehicle_CV90:          mod.VehicleList = mod.VehicleList.CV90;
let Vehicle_F16:           mod.VehicleList = mod.VehicleList.F16;
let Vehicle_F22:           mod.VehicleList = mod.VehicleList.F22;
let Vehicle_Flyer60:       mod.VehicleList = mod.VehicleList.Flyer60;
let Vehicle_Quadbike:      mod.VehicleList = mod.VehicleList.Quadbike;
let Vehicle_UH60:          mod.VehicleList = mod.VehicleList.UH60;

export async function OnGameModeStarted() {
    mod.EnableHQ(mod.GetHQ(1), true)

    spawnerID.forEach((spawnerID) => {
        SpawnAI(mod.GetSpawner(spawnerID));
        mod.AISetUnspawnOnDead(mod.GetSpawner(spawnerID), true);
        mod.SetUnspawnDelayInSeconds(mod.GetSpawner(spawnerID), 0);
    })

    InitVehicleSpawner()

    TickUpdate();
}

export function OnPlayerJoinGame(player: mod.Player): void {
    if (!isAI(player)) {
        let srPlayer = SrPlayer.get(player);
    }
    else return;
}

export function OnPlayerDied(player: mod.Player): void {
    if (isAI(player)) {
        let id = mod.GetObjId(player);
        let deadAI = SrSoldier.getByPlayer(player);
        if (deadAI){
            SrSoldier.removeDeadAI(id);
            SpawnAI(deadAI.spawner);
        }
    }
}

export function OnSpawnerSpawned(player: mod.Player, spawner : mod.Spawner): void{
    if (isAI(player)){
        let srSoldier = SrSoldier.get(player, spawner);
        if (srSoldier) {
            srSoldier.setState();
        }
    }
    else return;
}

export function OnPlayerInteract(player: mod.Player, eventInteractPoint: mod.InteractPoint) {
    EndGame(player);
}

class SrSoldier {
    player: mod.Player;
    playerId: number;
    spawner: mod.Spawner;

    static #allSrSoldiers: {[id: number]: SrSoldier} = {};
    constructor(player: mod.Player, spawner : mod.Spawner) {
        this.player = player;
        this.playerId = mod.GetObjId(player);
        this.spawner = spawner;
    }

    setState(): void {
        let player = this.player;
        mod.AIEnableTargeting(player, false)
        mod.AIIdleBehavior(player)
        mod.AIEnableShooting(player, false);
    }

    static get(player: mod.Player, spawner: mod.Spawner): SrSoldier | undefined {
        if (mod.GetObjId(player) > -1) {
            let index = mod.GetObjId(player);

            let srSoldier = this.#allSrSoldiers[index];
            if (!srSoldier) {
                srSoldier = new SrSoldier(player, spawner);
                this.#allSrSoldiers[index] = srSoldier;
            }
            return srSoldier;
        }
        return undefined;
    }

    static getByPlayer(player: mod.Player): SrSoldier | undefined {
        const id = mod.GetObjId(player);
        return SrSoldier.#allSrSoldiers[id];
    }

    static removeDeadAI(id: number): void {
        delete this.#allSrSoldiers[id];
    }
}

class SrPlayer {
    player: mod.Player;
    playerId: number;

    static #allSrPlayers: {[id: number]: SrPlayer} = {};
    constructor(player: mod.Player) {
        this.player = player;
        this.playerId = mod.GetObjId(player);
    }

    static get(player: mod.Player): SrPlayer | undefined {
        if (mod.GetObjId(player) > -1) {
            mod.SetTeam(player, mod.GetTeam(1));
            let index = mod.GetObjId(player);

            let srPlayer = this.#allSrPlayers[index];
            if (!srPlayer) {
                srPlayer = new SrPlayer(player);
                this.#allSrPlayers[index] = srPlayer;
            }
            return srPlayer;
        }
        return undefined;
    }

    static refillAllAmmo(): void {
        for (const sp of Object.values(this.#allSrPlayers)) {
            RefillPlayersAmmo(sp.player);
        }
    }
}

async function TickUpdate() {
    let tickRate: number = 0.05;
    while (true) {
        await mod.Wait(tickRate);
        SrPlayer.refillAllAmmo();
    }
}

function SpawnAI(spawner : mod.Spawner):void{
    mod.SpawnAIFromAISpawner(spawner, mod.SoldierClass.Assault, mod.GetTeam(2))
}

function isAI(player: mod.Player): boolean {
    return mod.GetSoldierState(player, mod.SoldierStateBool.IsAISoldier)
}

function RefillPlayersAmmo(player: mod.Player) {
    mod.SetInventoryAmmo(player, mod.InventorySlots.PrimaryWeapon, 1000);
    mod.SetInventoryMagazineAmmo(player, mod.InventorySlots.PrimaryWeapon, 1000);

    mod.SetInventoryAmmo(player, mod.InventorySlots.SecondaryWeapon, 1000);
    mod.SetInventoryMagazineAmmo(player, mod.InventorySlots.SecondaryWeapon, 1000);
}

function EndGame(player: mod.Player) {
    mod.EndGameMode(player);
}

function SetVehicleSpawner(spawnerID : number, vehicle: mod.VehicleList):void{
    let spawner: mod.VehicleSpawner = mod.GetVehicleSpawner(spawnerID);
    mod.SetVehicleSpawnerVehicleType(spawner, vehicle);
    mod.SetVehicleSpawnerAutoSpawn(spawner, true);
    mod.SetVehicleSpawnerRespawnTime(spawner, 0.5);
    mod.ForceVehicleSpawnerSpawn(spawner);
}

function InitVehicleSpawner(): void {
    SetVehicleSpawner(101, Vehicle_Abrams);
    SetVehicleSpawner(102, Vehicle_AH64);
    SetVehicleSpawner(103, Vehicle_Cheetah);
    SetVehicleSpawner(104, Vehicle_CV90);
    SetVehicleSpawner(105, Vehicle_F16);
    SetVehicleSpawner(106, Vehicle_F22);
    SetVehicleSpawner(107, Vehicle_Flyer60);
    SetVehicleSpawner(108, Vehicle_Quadbike);
    SetVehicleSpawner(109, Vehicle_UH60);
}
