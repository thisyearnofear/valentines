import { PetMinted, PetLeveled } from "../generated/HeartPet/HeartPet";
import { Pet } from "../generated/schema";

export function handlePetMinted(event: PetMinted): void {
  let id = event.params.tokenId.toString();
  let pet = new Pet(id);
  pet.owner = event.params.to;
  pet.level = BigInt.fromI32(0);
  pet.created = event.block.timestamp;
  pet.save();
}

export function handlePetLeveled(event: PetLeveled): void {
  let id = event.params.tokenId.toString();
  let pet = Pet.load(id);
  if (pet) {
    pet.level = event.params.level;
    pet.save();
  }
}