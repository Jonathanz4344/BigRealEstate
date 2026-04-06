import type { IHighlightComponentDims } from './types';
import { useDimensions } from './useDimensions';

export const useCampaignHighlightComponents = () => {
    const [emailAllRef, emailAllDims, _setEmailAllDims, emailAllCount] =
      useDimensions();
    const [contactRef, contactDims, _setContactDims, contactCount] =
      useDimensions();
    const [notesRef, notesDims, _setNotesDims, notesCount] =
      useDimensions();
    const [infoRef, infoDims, _setInfoDims, infoCount] =
      useDimensions();
    const highlightComponentDims: (IHighlightComponentDims | null)[] = [
      null,
      { ref: emailAllRef, dims: emailAllDims},
      { ref: contactRef, dims: contactDims},
      { ref: notesRef, dims: notesDims},
      { ref: infoRef, dims: infoDims}
    ];
    const highlightComponentDimsChange = [
      emailAllCount,
      contactCount,
      notesCount,
      infoCount
    ];
  
    return {
      refs: {
        emailAllRef,
        contactRef,
        notesRef,
        infoRef
      },
  
      highlightComponentDims,
      highlightComponentDimsChange,
    };
}