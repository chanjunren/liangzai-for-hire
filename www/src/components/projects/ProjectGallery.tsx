import { GalleryProjectInfo } from "@site/src/types";
import { FC } from "react";
import useGallery from "../home/hooks/useGallery";
import MyOldPortfolioBaby from "./myOldPortfolioBaby";
import PixelLabInfo from "./pixelLab";
import PortalProject from "./portal";
import ProjectCard from "./ProjectCard";
import ThreeJSCheat from "./threeJsCheat";
import VaultusaurusProject from "./vaultusaurus";

export const GALLERY_PROJECTS: GalleryProjectInfo[] = [
  VaultusaurusProject,
  PortalProject,
  PixelLabInfo,
  ThreeJSCheat,
  MyOldPortfolioBaby,
];

const ProjectGallery: FC = () => {
  const { onGalleryProjSelected } = useGallery();

  return (
    <>
      {GALLERY_PROJECTS.map((proj) => (
        <ProjectCard
          info={proj}
          onClick={() => onGalleryProjSelected(proj)}
          key={`proj-${proj.id}`}
        />
      ))}
    </>
  );
};

export default ProjectGallery;
