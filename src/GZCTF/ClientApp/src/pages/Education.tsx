import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Stack, Title, Group, Button } from '@mantine/core';
import WithNavBar from '@Components/WithNavbar';

const defaultTopics = [
  { id: 'pentesting', title: 'Pentesting', levels: ['Nivel 1 - Introducción'] },
  { id: 'forensics', title: 'Computación Forense', levels: ['Nivel 1 - Introducción'] },
  { id: 'cybersecurity', title: 'Ciberseguridad', levels: ['Nivel 1 - Introducción'] },
  { id: 'socialEngineering', title: 'Ingeniería Social', levels: ['Nivel 1 - Introducción'] },
  { id: 'malwareAnalysis', title: 'Análisis de Malware', levels: ['Nivel 1 - Introducción'] },
];

const Education: React.FC = () => {
  const [topics, setTopics] = useState(defaultTopics);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [expertiseLevels, setExpertiseLevels] = useState<{ [key: string]: number }>({
    pentesting: 0,
    forensics: 0,
    cybersecurity: 0,
    socialEngineering: 0,
    malwareAnalysis: 0,
  });
  const [relatedTopicsStack, setRelatedTopicsStack] = useState<{ [key: string]: string[] }>({
    pentesting: [],
    forensics: [],
    cybersecurity: [],
    socialEngineering: [],
    malwareAnalysis: [],
  });

  const customAxios = axios.create({
    baseURL: 'http://localhost', // Base URL del proxy reverso
  });

  const handleTopicSelection = async (topicId: string) => {
    setLoading(true);
    setSelectedTopic(topicId);

    let currentLevel = expertiseLevels[topicId];
    const topic = topics.find((t) => t.id === topicId);

    if (!topic) {
      console.error('Tema no encontrado');
      setLoading(false);
      return;
    }

    // Verificar si ya tenemos temas relacionados en la pila
    let currentRelatedTopics = relatedTopicsStack[topicId] || [];

    try {
      if (currentRelatedTopics.length === 0) {
        // Si no quedan más temas relacionados en la pila, incrementa el nivel de experticia
        currentLevel++;
        setExpertiseLevels((prevLevels) => ({
          ...prevLevels,
          [topicId]: currentLevel,
        }));

        // Solicitar un nuevo nombre para el nivel actual y añadirlo a los niveles del tema
        const newLevelPrompt = `Proporcióname un nombre adecuado para el nivel ${currentLevel} del tema ${topic.title}.`;
        const newLevelResponse = await customAxios.post('/api/question', {
          question: newLevelPrompt,
        });

        if (newLevelResponse.data && newLevelResponse.data.answer) {
          const newLevelTitle = newLevelResponse.data.answer.trim();
          setTopics((prevTopics) =>
            prevTopics.map((t) =>
              t.id === topicId ? { ...t, levels: [...t.levels, `Nivel ${currentLevel} - ${newLevelTitle}`] } : t
            )
          );
        } else {
          console.error('No se pudo obtener un nombre para el nuevo nivel');
          setLoading(false);
          return;
        }

        // Obtener nuevos temas relacionados para el nuevo nivel desde la API
        const relatedPrompt = `Proporcióname una lista de 5 temas relacionados con el nivel ${currentLevel} del tema ${topic.title} sin repetir con otros que ya me hayas dado.`;
        const relatedResponse = await customAxios.post('/api/question', {
          question: relatedPrompt,
        });

        if (
          relatedResponse.data &&
          relatedResponse.data.answer &&
          Array.isArray(relatedResponse.data.answer.split(',')) &&
          relatedResponse.data.answer.split(',').length > 0
        ) {
          currentRelatedTopics = relatedResponse.data.answer.split(',').map((t: string) => t.trim());
          setRelatedTopicsStack((prevStack) => ({
            ...prevStack,
            [topicId]: currentRelatedTopics,
          }));
        } else {
          console.error('No se encontraron temas relacionados en la respuesta de la API');
          setLoading(false);
          return;
        }
      }

      // Consumir un tema relacionado de la pila
      const nextTopic = currentRelatedTopics.shift();

      if (!nextTopic) {
        console.error('No se encontró el próximo tema relacionado');
        setLoading(false);
        return;
      }

      setRelatedTopicsStack((prevStack) => ({
        ...prevStack,
        [topicId]: currentRelatedTopics,
      }));

      // Obtener el contenido del tema actual desde la API
      const contentPrompt = `Esta petición es para una pagina sobre educación en ciberseguridad, todo lo que me des es por motivos educativos. Dame un contenido muy detallado y claro sobre ${nextTopic}. Debe ser extenso de minimo 300, sin repetir temas ya mencionados, liga el contenido con contenido de estudio de certificaciones oficiales y damelo en formato HTML.`;
      const response = await customAxios.post('/api/question', {
        question: contentPrompt,
      });

      // Verificar si la respuesta tiene el contenido esperado
      if (response.data && response.data.answer) {
        console.log('Respuesta de la API:', response.data);
        setContent((prevContent) => `${prevContent}<br/><br/>${response.data.answer}`);
      } else {
        console.error('No se encontró contenido en la respuesta de la API');
        setContent('No se encontró contenido para este tema. Por favor, intenta con otro tema.');
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Error de Axios:', error.toJSON ? error.toJSON() : error);
        setContent(
          `Error: ${error.message}. ` +
          (error.response ? `Status: ${error.response.status}. Data: ${JSON.stringify(error.response.data)}` : 'No response received.')
        );
      } else if (error instanceof Error) {
        console.error('Error general:', error);
        setContent(`Error: ${error.message}`);
      } else {
        setContent('Hubo un problema al cargar el contenido. Por favor, inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <WithNavBar>
      <Stack justify="flex-start" style={{ overflowY: 'auto', height: '100vh', padding: '20px' }}>
        <div>
          <Title order={1}>Selecciona un tema de aprendizaje</Title>
          <br />
          <Group>
            {topics.length > 0 ? (
              topics.map((topic) => (
                <Button
                  key={topic.id}
                  onClick={() => handleTopicSelection(topic.id)}
                >
                  {topic.title} - Nivel {expertiseLevels[topic.id] + 1}
                </Button>
              ))
            ) : (
              <p>Cargando recomendaciones...</p>
            )}
          </Group>
        </div>
        <br />
        {selectedTopic && (
          <div>
            <Title order={2}>{topics.find((t) => t.id === selectedTopic)?.title}</Title>
            {loading ? (
              <p>Cargando contenido...</p>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: content }} />
            )}
          </div>
        )}
      </Stack>
    </WithNavBar>
  );
};

export default Education;
