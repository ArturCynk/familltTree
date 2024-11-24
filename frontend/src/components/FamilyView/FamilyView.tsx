import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import LeftHeader from '../LeftHeader/LeftHeader';
import Modal from 'react-modal';

interface Marriage {
  partners: Person[];
  children?: Person[];
}

interface Person {
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'non-binary';
  birthDate?: string;
  deathDate?: string;
  children?: Person[];
  marriage?: Marriage;
}

const FamilyView: React.FC = () => {
  // State for modal visibility and selected person
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);

  // Generate family tree starting from 1 person and then recursively adding children
  const generateFamilies = (num: number) => {
    const families: Person[] = [];

    const createPerson = (generation: number, parent?: Person): Person => {
      const gender: 'male' | 'female' = generation % 2 === 0 ? 'male' : 'female';
      const firstName = `Person `;
      const lastName = `Doe `;
      const birthDate = `19${Math.floor(Math.random() * 10) + 70}-0${Math.floor(Math.random() * 9) + 1}-01`; // Random birth year from 1970-1979
      const person: Person = {
        firstName,
        lastName,
        gender,
        birthDate,
        children: [],
      };

      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(person);
      }

      return person;
    };

    const createFamilyTree = (person: Person, generation: number) => {
      if (generation >= 4) return;

      const numChildren = 1;
      for (let i = 0; i < numChildren; i++) {
        const child = createPerson(generation + 1, person);

        const numGrandchildren = 2;
        for (let j = 0; j < numGrandchildren; j++) {
          const grandchild = createPerson(generation + 2, child);

          const numGreatGrandchildren = 1;
          for (let k = 0; k < numGreatGrandchildren; k++) {
            createPerson(generation + 3, grandchild);
          }
        }
      }

      person.children?.forEach(child => createFamilyTree(child, generation + 1));
    };

    const rootPerson = createPerson(1);
    createFamilyTree(rootPerson, 1);

    families.push(rootPerson);
    return families;
  };

  const data = generateFamilies(10);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const width = 1000;
    const height = 800;

    svg.attr('viewBox', `0 0 ${width} ${height}`)
      .style('background', '#f9f9f9')
      .style('font-family', 'Arial');

    svg.selectAll("*").remove(); // Remove any previous content

    const zoomGroup = svg.append('g');

    const createHierarchy = (family: Person) => {
      const root = d3.hierarchy(family);
      
      if (family.marriage?.partners) {
        const marriageNode: Person = {
          firstName: `${family.marriage.partners[0].firstName} & ${family.marriage.partners[1].firstName}`,
          lastName: family.lastName,
          gender: 'non-binary',
          birthDate: "",
          deathDate: "",
          children: family.marriage.children,
        };

        const marriageRoot = d3.hierarchy(marriageNode);
        marriageRoot.children?.forEach(child => {
          child.parent = marriageRoot;
        });

        return marriageRoot;
      }

      return root;
    };

    const root = createHierarchy(data[0]); // Start with the first family

    const treeLayout = d3.tree<Person>().size([width, height - 100]);
    treeLayout(root);

    const nodes = root.descendants();
    const links = root.links();

    zoomGroup.selectAll('path.link')
      .data(links)
      .join('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', '#555')
      .attr('stroke-width', 2)
      .attr('d', d => {
        const source = { x: d.source.x ?? 0, y: d.source.y ?? 0 };
        const target = { x: d.target.x ?? 0, y: d.target.y ?? 0 };
        return `M${source.x},${source.y} L${source.x},${(source.y + target.y) / 2} L${target.x},${(source.y + target.y) / 2} L${target.x},${target.y}`;
      });

    const nodeGroups = zoomGroup.selectAll('g.node')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .on('click', (event, d) => {
        setSelectedPerson(d.data);
      });

    nodeGroups.append('rect')
      .attr('width', 100)
      .attr('height', 60)
      .attr('x', -50)
      .attr('y', -30)
      .attr('fill', d => (d.data.gender === 'male' ? '#87CEEB' : d.data.gender === 'female' ? '#FFC0CB' : '#D3D3D3'))
      .attr('rx', 5);

    nodeGroups.append('text')
      .attr('dy', 4)
      .attr('text-anchor', 'middle')
      .text(d => `${d.data.firstName} ${d.data.lastName}`);

    nodeGroups.append('text')
      .attr('dy', 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text(d => {
        const birth = d.data.birthDate ? `Born: ${d.data.birthDate}` : '';
        const death = d.data.deathDate ? `Died: ${d.data.deathDate}` : '';
        return `${birth} ${death}`;
      });

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2])
      .on('zoom', (event) => {
        zoomGroup.attr('transform', event.transform);
      });

    svg.call(zoom);

  }, [data]);

  return (
    <>
      <LeftHeader />
      <svg ref={svgRef} width="100%" height="96%" />
      
      {/* Modal */}
      <Modal isOpen={!!selectedPerson} onRequestClose={() => setSelectedPerson(null)} ariaHideApp={false}>
        {selectedPerson && (
          <div>
            <h2>{selectedPerson.firstName} {selectedPerson.lastName}</h2>
            <p><strong>Birth Date:</strong> {selectedPerson.birthDate || 'Unknown'}</p>
            <p><strong>Death Date:</strong> {selectedPerson.deathDate || 'Unknown'}</p>
            <button onClick={() => setSelectedPerson(null)} className="mt-4 p-2 bg-red-500 text-white rounded">Close</button>
          </div>
        )}
      </Modal>
    </>
  );
};

export default FamilyView;
